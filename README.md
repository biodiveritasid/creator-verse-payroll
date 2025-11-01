# Creator‑Verse Payroll

Payroll & attendance app for creator teams. Built with React + Vite, Firebase (Auth/Firestore/Storage), and shadcn/ui.

## Features (MVP)
- Role-based access: Admin, Investor (read-only), Creator
- Attendance: check-in/out with device fingerprint & geo-approx (optional)
- Timesheet & monthly hour target (progressive slab: min 130h)
- Payroll: base + allowances + dynamic incentives (no deductions; "protata with flag" policy)
- Expense proofs (image/pdf) & approvals
- Dashboard: GMV, commissions, expenses, profit, remaining capital
- Leaderboard by commissions

## Tech
- React + Vite + TypeScript
- Firebase Auth, Firestore, Storage, Cloud Functions
- UI: Tailwind + shadcn/ui + lucide-react

## Dev Quickstart
```bash
# 1) Install
pm i

# 2) Env
cp .env.example .env
# Fill Firebase keys + optional MAPS_API_KEY

# 3) Run
npm run dev
```

## Firestore Schema (draft)
```.yaml
users: {
  uid, name, email, role: oneOf("ADMIN", "INVESTOR", "CREATOR"),
  createdAt,
}
shifts: { id, userId, date, start, end, deviceHash, geo? }
reports: { id, userId, date, gmv, commission, notes }
expenses: { id, byUserId, date, amount, category, note, proofUrl, status: PENDING|APPROVED|REJECTED }
payroll: { id, userId, month, base, allowance, incentive, total, hours, slabMet: bool }
settings: { id, progressive: { minHours:130 }, flags: { protata:true } }
```

## Scripts
- `npm run lint`
- `npm run build`

## License
MIT
