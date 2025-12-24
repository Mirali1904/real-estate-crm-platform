import { conn } from "../../lib/db";
import { RowDataPacket, ResultSetHeader } from "mysql2";

export class GroupService {
  
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





  // Get groups where user is a member
  async getUserGroups(userId: number, tenantId: number) {
    const [groups] = await conn.query<RowDataPacket[]>(
      `SELECT g.*, u.name as creator_name, gm.role as user_role,
       (SELECT COUNT(*) FROM group_members WHERE group_id = g.id AND status = 'active') as member_count
       FROM groups g
       INNER JOIN group_members gm ON g.id = gm.group_id
       LEFT JOIN users u ON g.created_by = u.id
       WHERE gm.user_id = ? AND g.tenant_id = ? AND g.status = 'active' AND gm.status = 'active'
       ORDER BY g.created_at DESC`,
      [userId, tenantId]
    );
    return groups;
  }

  // Get single group details
  async getGroupById(groupId: number, tenantId: number) {
    const [groups] = await conn.query<RowDataPacket[]>(
      `SELECT g.*, u.name as creator_name, u.email as creator_email
       FROM groups g
       LEFT JOIN users u ON g.created_by = u.id
       WHERE g.id = ? AND g.tenant_id = ?`,
      [groupId, tenantId]
    );
    return groups[0] || null;
  }

  // Create new group
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
        `INSERT INTO groups (tenant_id, name, description, created_by, status, created_at)
         VALUES (?, ?, ?, ?, 'active', NOW())`,
        [tenantId, name, description, createdBy]
      );

      const groupId = result.insertId;

      await connection.query(
        `INSERT INTO group_members (group_id, user_id, role, status, created_at)
         VALUES (?, ?, 'ADMIN', 'active', NOW())`,
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

  // Update group
  async updateGroup(
    groupId: number,
    tenantId: number,
    name: string,
    description: string
  ) {
    const [result] = await conn.query<ResultSetHeader>(
      `UPDATE groups 
       SET name = ?, description = ?, updated_at = NOW()
       WHERE id = ? AND tenant_id = ?`,
      [name, description, groupId, tenantId]
    );
    return result.affectedRows > 0;
  }

  // Delete group (SOFT DELETE)
  async deleteGroup(groupId: number, tenantId: number) {
    const [result] = await conn.query<ResultSetHeader>(
      `UPDATE groups SET status = 'inactive' WHERE id = ? AND tenant_id = ?`,
      [groupId, tenantId]
    );
    return result.affectedRows > 0;
  }

  // Get group members
  async getGroupMembers(groupId: number) {
    const [members] = await conn.query<RowDataPacket[]>(
      `SELECT gm.*, u.name, u.email, u.role as user_role
       FROM group_members gm
       INNER JOIN users u ON gm.user_id = u.id
       WHERE gm.group_id = ? AND gm.status = 'active'
       ORDER BY gm.role DESC, gm.created_at ASC`,
      [groupId]
    );
    return members;
  }

  // Add member to group
  async addMember(groupId: number, userId: number, role: string = "MEMBER") {
    const [existing] = await conn.query<RowDataPacket[]>(
      `SELECT id FROM group_members WHERE group_id = ? AND user_id = ?`,
      [groupId, userId]
    );

    if (existing.length > 0) {
      const [result] = await conn.query<ResultSetHeader>(
        `UPDATE group_members SET status = 'active', role = ? WHERE group_id = ? AND user_id = ?`,
        [role, groupId, userId]
      );
      return result.affectedRows > 0;
    } else {
      const [result] = await conn.query<ResultSetHeader>(
        `INSERT INTO group_members (group_id, user_id, role, status, created_at)
         VALUES (?, ?, ?, 'active', NOW())`,
        [groupId, userId, role]
      );
      return result.insertId;
    }
  }

  // Remove member from group
  async removeMember(groupId: number, userId: number) {
    const [result] = await conn.query<ResultSetHeader>(
      `UPDATE group_members SET status = 'inactive' WHERE group_id = ? AND user_id = ?`,
      [groupId, userId]
    );
    return result.affectedRows > 0;
  }

  // 🔥 ONLY GROUP CREATOR CHECK (VERY IMPORTANT)
  async isGroupAdmin(groupId: number, userId: number): Promise<boolean> {
    const [rows] = await conn.query<RowDataPacket[]>(
      `SELECT 1 FROM groups WHERE id = ? AND created_by = ?`,
      [groupId, userId]
    );

    return rows.length > 0;
  }

  // Check if user is group member
  async isGroupMember(groupId: number, userId: number): Promise<boolean> {
    const [result] = await conn.query<RowDataPacket[]>(
      `SELECT id FROM group_members 
       WHERE group_id = ? AND user_id = ? AND status = 'active'`,
      [groupId, userId]
    );
    return result.length > 0;
  }

  async deletePostResponse(responseId: number) {
    await conn.execute(
      "DELETE FROM group_post_responses WHERE id = ?",
      [responseId]
    );
  }

  // Create post in group
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
    }
  ) {
    const [result] = await conn.query<ResultSetHeader>(
      `INSERT INTO group_posts 
       (group_id, user_id, tenant_id, post_type, title, description, location, budget, status, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'active', NOW())`,
      [
        groupId,
        userId,
        tenantId,
        postData.postType,
        postData.title,
        postData.description,
        postData.location || null,
        postData.budget || null,
      ]
    );
    return result.insertId;
  }

  // Get group posts
  async getGroupPosts(groupId: number) {
    const [posts] = await conn.query<RowDataPacket[]>(
      `SELECT gp.*, u.name as author_name, u.email as author_email,
       (SELECT COUNT(*) FROM group_post_responses WHERE post_id = gp.id) as response_count
       FROM group_posts gp
       INNER JOIN users u ON gp.user_id = u.id
       WHERE gp.group_id = ? AND gp.status = 'active'
       ORDER BY gp.created_at DESC`,
      [groupId]
    );
    return posts;
  }

  // Add response to post
  async addPostResponse(postId: number, userId: number, message: string) {
    const [result] = await conn.query<ResultSetHeader>(
      `INSERT INTO group_post_responses (post_id, user_id, message, created_at)
       VALUES (?, ?, ?, NOW())`,
      [postId, userId, message]
    );
    return result.insertId;
  }

  // Get post responses
  async getPostResponses(postId: number) {
    const [responses] = await conn.query<RowDataPacket[]>(
      `SELECT gpr.*, u.name as author_name, u.email as author_email
       FROM group_post_responses gpr
       INNER JOIN users u ON gpr.user_id = u.id
       WHERE gpr.post_id = ?
       ORDER BY gpr.created_at ASC`,
      [postId]
    );
    return responses;
  }

  // Get available agents
  async getAvailableAgents(groupId: number, tenantId: number) {
    const [agents] = await conn.query<RowDataPacket[]>(
      `SELECT u.id, u.name, u.email, u.role
       FROM users u
       WHERE u.tenant_id = ? 
       AND u.role = 'AGENT'
       AND u.id NOT IN (
         SELECT user_id FROM group_members 
         WHERE group_id = ? AND status = 'active'
       )
       ORDER BY u.name ASC`,
      [tenantId, groupId]
    );
    return agents;
  }
}
