import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendTeamApplicationEmails } from "@/lib/email";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, phone, department, batch, interest, message } = body;

    // Validation
    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json({ success: false, error: "Full name is required." }, { status: 400 });
    }

    if (!email || typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return NextResponse.json({ success: false, error: "A valid email address is required." }, { status: 400 });
    }

    if (!department || typeof department !== "string" || !department.trim()) {
      return NextResponse.json({ success: false, error: "Department is required." }, { status: 400 });
    }

    if (!batch || typeof batch !== "string" || !batch.trim()) {
      return NextResponse.json({ success: false, error: "Batch / graduation year is required." }, { status: 400 });
    }

    if (!interest || typeof interest !== "string" || !interest.trim()) {
      return NextResponse.json({ success: false, error: "Area of interest is required." }, { status: 400 });
    }

    const trimmedName = name.trim();
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPhone = phone ? phone.trim() : null;
    const trimmedDepartment = department.trim();
    const trimmedBatch = batch.trim();
    const trimmedInterest = interest.trim();
    const trimmedMessage = message ? message.trim() : null;

    // 1. Save to Supabase team_applications table (Admin Page coverage)
    let savedToDb = false;
    let createdAt = new Date().toISOString();

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const supabaseServer = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    try {
      const { error: dbError } = await supabaseServer
        .from("team_applications")
        .insert([
          {
            name: trimmedName,
            email: trimmedEmail,
            phone: trimmedPhone,
            department: trimmedDepartment,
            batch: trimmedBatch,
            interest_area: trimmedInterest,
            message: trimmedMessage,
          },
        ]);

      if (dbError) {
        console.error("[Database Warning] team_applications insert error:", dbError.message);
      } else {
        savedToDb = true;
      }
    } catch (dbErr: any) {
      console.error("[Database Exception] Failed saving to team_applications:", dbErr?.message || dbErr);
    }

    // 2. Dispatch Confirmation to Applicant and Alert to Admin Team
    let emailResult = { success: true, emailSent: false };
    try {
      emailResult = await sendTeamApplicationEmails({
        name: trimmedName,
        email: trimmedEmail,
        phone: trimmedPhone || undefined,
        department: trimmedDepartment,
        batch: trimmedBatch,
        interest_area: trimmedInterest,
        message: trimmedMessage || undefined,
        created_at: createdAt,
      });
    } catch (mailErr: any) {
      console.error("[Email Exception] Failed sending application emails:", mailErr?.message || mailErr);
    }

    return NextResponse.json({
      success: true,
      message: "Application submitted successfully! A confirmation email has been sent.",
      savedToDb,
      emailSent: emailResult.emailSent,
    });
  } catch (err: any) {
    console.error("[API Error] /api/team/apply failed:", err);
    return NextResponse.json(
      { success: false, error: "Internal server error. Please try again." },
      { status: 500 }
    );
  }
}
