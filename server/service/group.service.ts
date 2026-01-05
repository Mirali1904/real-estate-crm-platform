import { conn } from "../../lib/db";
import { RowDataPacket, ResultSetHeader } from "mysql2";

export class GroupService {

  /* ======================================
     GET GROUPS FOR TENANT (AGENCY BASED)
  ====================================== */
  async getGroupsForTenant(tenantId: number, userId: number) {
    const [groups] = await conn.query<RowDataPacket[]>(
      `
      SELECT DISTINCT
        g.*,
        u.name AS creator_name,
        CASE
          WHEN g.created_by = ? THEN 'ADMIN'
          ELSE 'MEMBER'
        END AS user_role,
        (
          SELECT COUNT(*)
          FROM group_agencies ga2
          WHERE ga2.group_id = g.id
            AND ga2.status = 'active'
        ) AS member_count
      FROM groups g
      LEFT JOIN group_agencies ga
        ON ga.group_id = g.id
        AND ga.tenant_id = ?
        AND ga.status = 'active'
      LEFT JOIN users u
        ON g.created_by = u.id
      WHERE g.status = 'active'
        AND (
          g.created_by = ?
          OR ga.tenant_id IS NOT NULL
        )
      ORDER BY g.created_at DESC
      `,
      [userId, tenantId, userId]
    );

    return groups;
  }

  async getGroupsForUser(userId: number, tenantId: number) {
    return this.getGroupsForTenant(tenantId, userId);
  }

  /* ======================================
     GET SINGLE GROUP
  ====================================== */
  async getGroupById(groupId: number) {
    const [groups] = await conn.query<RowDataPacket[]>(
      `
      SELECT g.*, u.name AS creator_name, u.email AS creator_email
      FROM groups g
      LEFT JOIN users u ON g.created_by = u.id
      WHERE g.id = ?
      `,
      [groupId]
    );
    return groups[0] || null;
  }

  /* ======================================
     CREATE GROUP
  ====================================== */
  async createGroup(
    tenantId: number,
    name: string,
    description: string,
    createdBy: number
  ) {
    const connection = await conn.getConnection();
    try {
      await connection.beginTransaction();

      const [result] = await connection.query<ResultSetHeader>(
        `
        INSERT INTO groups
          (tenant_id, name, description, created_by, status, created_at)
        VALUES (?, ?, ?, ?, 'active', NOW())
        `,
        [tenantId, name, description, createdBy]
      );

      const groupId = result.insertId;

      // creator’s tenant auto-added
      await connection.query(
        `
        INSERT INTO group_agencies
          (group_id, tenant_id, status, joined_at)
        VALUES (?, ?, 'active', NOW())
        `,
        [groupId, tenantId]
      );

      await connection.commit();
      return groupId;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  /* ======================================
     ✅ ADD THIS METHOD (NEW)
     Used by POST /api/groups
  ====================================== */
  async addAgencyToGroup(groupId: number, tenantId: number) {
    return this.addAgency(groupId, tenantId);
  }

  /* ======================================
     UPDATE GROUP
  ====================================== */
  async updateGroup(
    groupId: number,
    tenantId: number,
    name: string,
    description: string
  ) {
    const [result] = await conn.query<ResultSetHeader>(
      `
      UPDATE groups
      SET name = ?, description = ?, updated_at = NOW()
      WHERE id = ? AND tenant_id = ?
      `,
      [name, description, groupId, tenantId]
    );
    return result.affectedRows > 0;
  }

  /* ======================================
     DELETE GROUP (HARD DELETE)
  ====================================== */
  async deleteGroup(groupId: number, tenantId: number) {
    const connection = await conn.getConnection();
    try {
      await connection.beginTransaction();

      await connection.query(
        `
        DELETE FROM group_post_responses
        WHERE post_id IN (
          SELECT id FROM group_posts WHERE group_id = ?
        )
        `,
        [groupId]
      );

      await connection.query(
        `DELETE FROM group_posts WHERE group_id = ?`,
        [groupId]
      );

      await connection.query(
        `DELETE FROM group_agencies WHERE group_id = ?`,
        [groupId]
      );

      await connection.query(
        `DELETE FROM group_members WHERE group_id = ?`,
        [groupId]
      );

      const [result] = await connection.query<ResultSetHeader>(
        `
        DELETE FROM groups
        WHERE id = ? AND tenant_id = ?
        `,
        [groupId, tenantId]
      );

      await connection.commit();
      return result.affectedRows > 0;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  /* ======================================
     GET GROUP AGENCIES
  ====================================== */
  async getGroupAgencies(groupId: number) {
    const [rows] = await conn.query<RowDataPacket[]>(
      `
      SELECT
        ga.id,
        ga.tenant_id,
        u.name,
        u.email
      FROM group_agencies ga
      JOIN users u ON u.tenant_id = ga.tenant_id
      WHERE ga.group_id = ?
        AND ga.status = 'active'
      ORDER BY u.name ASC
      `,
      [groupId]
    );
    return rows;
  }

  /* ======================================
     ADD / REMOVE AGENCY
  ====================================== */
  async addAgency(groupId: number, tenantId: number) {
    const [existing] = await conn.query<RowDataPacket[]>(
      `
      SELECT id FROM group_agencies
      WHERE group_id = ? AND tenant_id = ?
      `,
      [groupId, tenantId]
    );

    if (existing.length > 0) {
      const [res] = await conn.query<ResultSetHeader>(
        `
        UPDATE group_agencies
        SET status = 'active'
        WHERE group_id = ? AND tenant_id = ?
        `,
        [groupId, tenantId]
      );
      return res.affectedRows > 0;
    }

    const [res] = await conn.query<ResultSetHeader>(
      `
      INSERT INTO group_agencies
        (group_id, tenant_id, status, joined_at)
      VALUES (?, ?, 'active', NOW())
      `,
      [groupId, tenantId]
    );
    return res.insertId;
  }

  async removeAgency(groupId: number, tenantId: number) {
    const [result] = await conn.query<ResultSetHeader>(
      `
      UPDATE group_agencies
      SET status = 'inactive'
      WHERE group_id = ? AND tenant_id = ?
      `,
      [groupId, tenantId]
    );
    return result.affectedRows > 0;
  }

  /* ======================================
     ADMIN CHECK
  ====================================== */
  async isGroupAdmin(groupId: number, userId: number): Promise<boolean> {
    const [rows] = await conn.query<RowDataPacket[]>(
      `
      SELECT 1
      FROM groups
      WHERE id = ? AND created_by = ?
      `,
      [groupId, userId]
    );
    return rows.length > 0;
  }

  /* ======================================
     POSTS (UNCHANGED)
  ====================================== */
 async createPost(
  groupId: number,
  userId: number,
  tenantId: number,
  postData: {
    postType: string;
    title: string;
    description: string;
    location?: string;
    budget?: number;
    sellerId?: number;
  }
) {
  const [result] = await conn.query<ResultSetHeader>(
  `
  INSERT INTO group_posts
    (
      group_id,
      user_id,
      tenant_id,
      post_type,
      title,
      description,
      location,
      budget,
      status,
      seller_id,
      created_at
    )
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'active', ?, NOW())
  `,
  [
    groupId,
    userId,
    tenantId,
    postData.postType,
    postData.title,
    postData.description,
    postData.location || null,
    postData.budget || null,
    postData.sellerId || null, // ✅ NOW WILL SAVE
  ]
);


  return result.insertId;
}


  async getGroupPosts(groupId: number) {
    const [posts] = await conn.query<RowDataPacket[]>(
      `
      SELECT gp.*, gp.seller_id,   u.name AS author_name, u.email AS author_email,
      (SELECT COUNT(*) FROM group_post_responses WHERE post_id = gp.id) AS response_count
      FROM group_posts gp
      INNER JOIN users u ON gp.user_id = u.id
      WHERE gp.group_id = ? AND gp.status = 'active'
      ORDER BY gp.created_at DESC
      `,
      [groupId]
    );
    return posts;
  }

  async addPostResponse(postId: number, userId: number, message: string) {
    const [result] = await conn.query<ResultSetHeader>(
      `
      INSERT INTO group_post_responses (post_id, user_id, message, created_at)
      VALUES (?, ?, ?, NOW())
      `,
      [postId, userId, message]
    );
    return result.insertId;
  }

  async getPostResponses(postId: number) {
    const [responses] = await conn.query<RowDataPacket[]>(
      `
      SELECT gpr.*, u.name AS author_name, u.email AS author_email
      FROM group_post_responses gpr
      INNER JOIN users u ON gpr.user_id = u.id
      WHERE gpr.post_id = ?
      ORDER BY gpr.created_at ASC
      `,
      [postId]
    );
    return responses;
  }
}
