import AdminJS from "adminjs";
import AdminJSExpress from "@adminjs/express";
import { Database, Resource, Adapter } from "@adminjs/sql";
import { Express } from "express";
import { env } from "../config/env.js";

/**
 * Sets up AdminJS and mounts it on the Express application.
 * AdminJS must be mounted before body parsers in app.ts.
 */
export async function setupAdmin(app: Express) {
  AdminJS.registerAdapter({ Database, Resource });

  const adapter = new Adapter("postgresql", {
    connectionString: env.DATABASE_URL,
    database: env.DATABASE_URL.split("/").pop()?.split("?")[0] || "opencall",
  });

  const db = await adapter.init();

  const admin = new AdminJS({
    resources: [
      {
        resource: db.table("users"),
        options: {
          properties: {
            password_hash: { isVisible: false },
          },
        },
      },
      { resource: db.table("regions") },
      { resource: db.table("source_upload_batches") },
      { resource: db.table("flex_wip_records") },
      { resource: db.table("renderways_records") },
      { resource: db.table("call_plan_records") },
      { resource: db.table("pincode_area_mappings") },
      { resource: db.table("sla_rules") },
      { resource: db.table("daily_call_plan_reports") },
      { resource: db.table("daily_call_plan_report_rows") },
    ],
    rootPath: "/admin",
  });

  // Build and mount the router
  const router = AdminJSExpress.buildRouter(admin);
  app.use(admin.options.rootPath, router);
}
