/*
 * config.js — ตั้งค่าการเชื่อมต่อ Supabase (ระบบบัญชี / ซิงก์ข้อมูลข้ามเครื่อง)
 * ------------------------------------------------------------
 * ใส่ค่าจาก Supabase → Project Settings → API
 *   SUPABASE_URL      : Project URL เช่น https://abcdxyz.supabase.co
 *   SUPABASE_ANON_KEY : anon / publishable key (คีย์สาธารณะ ใส่ในเว็บได้ ปลอดภัยเพราะตารางเปิด RLS ไว้)
 *
 * ⚠️ ห้ามใส่ service_role / secret key ที่นี่เด็ดขาด (คีย์นั้นข้ามสิทธิ์ RLS ได้ทั้งหมด)
 * ถ้าเว้นว่างไว้ แอปจะทำงานแบบเดิม (เก็บในเครื่องอย่างเดียว ไม่มีระบบบัญชี)
 */
window.NS = window.NS || {};

NS.CONFIG = {
  SUPABASE_URL: '',
  SUPABASE_ANON_KEY: ''
};
