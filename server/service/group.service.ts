import { conn } from "../../lib/db";
import { RowDataPacket, ResultSetHeader } from "mysql2";

export class GroupService {

  /* ================= GROUP LIST ================= */

  async getGroupsForUser(userId: number) {
    const [groups] = await conn.query<RowDataPacket[]>(
      `
      SELECT DISTINCT
        g.*,
        u.name AS creator_name,
        (
          SELECT COUNT(*)
          FROM group_agencies ga2
          WHERE ga2.group_id = g.id
            AND ga2.status = 'active'
        ) AS member_count,
        CASE
          WHEN g.created_by = ? THEN 'ADMIN'
          ELSE 'MEMBER'
        END AS user_role
      FROM groups g
      LEFT JOIN group_agencies ga
        ON ga.group_id = g.id
        AND ga.agency_id = ?
        AND ga.status = 'active'
      LEFT JOIN users u ON g.created_by = u.id
      WHERE g.status = 'active'
        AND (
          g.created_by = ?
          OR ga.agency_id IS NOT NULL
        )
      ORDER BY g.created_at DESC
      `,
      [userId, userId, userId]
    );

    return groups;
  }

  async getUserGroups(userId: number, tenantId: number) {
    const [groups] = await conn.query<RowDataPacket[]>(
      `
      SELECT 
        g.*, 
        u.name AS creator_name, 
        gm.role AS user_role,
        (
          SELECT COUNT(*) 
          FROM group_members 
          WHERE group_id = g.id AND status = 'active'
        ) AS member_count
      FROM groups g
      INNER JOIN group_members gm ON g.id = gm.group_id
      LEFT JOIN users u ON g.created_by = u.id
      WHERE gm.user_id = ?
        AND g.tenant_id = ?
        AND g.status = 'active'
        AND gm.status = 'active'
      ORDER BY g.created_at DESC
      `,
      [userId, tenantId]
    );

    return groups;
  }

  async getGroupById(groupId: number, tenantId: number) {
    const [groups] = await conn.query<RowDataPacket[]>(
      `
      SELECT g.*, u.name AS creator_name, u.email AS creator_email
      FROM groups g
      LEFT JOIN users u ON g.created_by = u.id
      WHERE g.id = ? AND g.tenant_id = ?
      `,
      [groupId, tenantId]
    );

    return groups[0] || null;
  }

  /* ================= GROUP CRUD ================= */

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

      await connection.query(
        `
        INSERT INTO group_members 
        (group_id, user_id, role, status, created_at)
        VALUES (?, ?, 'ADMIN', 'active', NOW())
        `,
        [groupId, createdBy]
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

  async deleteGroup(groupId: number, tenantId: number) {
    const [result] = await conn.query<ResultSetHeader>(
      `
      UPDATE groups 
      SET status = 'inactive'
      WHERE id = ? AND tenant_id = ?
      `,
      [groupId, tenantId]
    );

    return result.affectedRows > 0;
  }

  /* ================= MEMBERS ================= */

  async isGroupMember(groupId: number, userId: number): Promise<boolean> {
    const [rows] = await conn.query<RowDataPacket[]>(
      `
      SELECT id
      FROM group_members
      WHERE group_id = ?
        AND user_id = ?
        AND status = 'active'
      `,
      [groupId, userId]
    );

    return rows.length > 0;
  }

  async getGroupMembers(groupId: number) {
    const [members] = await conn.query<RowDataPacket[]>(
      `
      SELECT gm.*, u.name, u.email, u.role AS user_role
      FROM group_members gm
      INNER JOIN users u ON gm.user_id = u.id
      WHERE gm.group_id = ?
        AND gm.status = 'active'
      ORDER BY gm.role DESC, gm.created_at ASC
      `,
      [groupId]
    );

    return members;
  }

  /* ================= POSTS ================= */

  async createPost(
    groupId: number,
    userId: number,
    tenantId: number,
    postData: {
      postType: "buyer" | "seller";
      title: string;
      description?: string;
      location?: string;
      budget?: number;
      referenceId?: number;
    }
  ) {
    const [result] = await conn.query<ResultSetHeader>(
      `
      INSERT INTO group_posts (
        group_id,
        user_id,
        tenant_id,
        post_type,
        reference_id,
        title,
        description,
        location,
        budget,
        status,
        created_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', NOW())
      `,
      [
        groupId,
        userId,
        tenantId,
        postData.postType,
        postData.referenceId || null,
        postData.title,
        postData.description || null,
        postData.location || null,
        postData.budget || null,
      ]
    );

    return result.insertId;
  }

  async getGroupPosts(groupId: number) {
    const [posts] = await conn.query<RowDataPacket[]>(
      `
      SELECT 
        gp.*,
        u.name AS author_name,

        b.name        AS buyer_name,
        b.requirement AS buyer_requirement,
        b.location    AS buyer_location,
        b.budget_min  AS buyer_budget_min,
        b.budget_max  AS buyer_budget_max,

        s.name          AS seller_name,
        s.property_type AS seller_property_type,
        s.price         AS seller_price,
        s.bedrooms      AS seller_bedrooms,

        (
          SELECT COUNT(*) 
          FROM group_post_responses 
          WHERE post_id = gp.id
        ) AS response_count

      FROM group_posts gp
      INNER JOIN users u ON gp.user_id = u.id

      LEFT JOIN buyers b
        ON gp.reference_id = b.id
       AND gp.post_type = 'buyer'

      LEFT JOIN sellers s
        ON gp.reference_id = s.id
       AND gp.post_type = 'seller'

      WHERE gp.group_id = ?
        AND gp.status = 'active'
      ORDER BY gp.created_at DESC
      `,
      [groupId]
    );

    return posts;
  }

  async addPostResponse(postId: number, userId: number, message: string) {
    const [result] = await conn.query<ResultSetHeader>(
      `
      INSERT INTO group_post_responses 
      (post_id, user_id, message, created_at)
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
