# Project Overview: Football Team Management App

## Descriere generală

Aceasta este o aplicație web pentru gestionarea utilizatorilor unei echipe de fotbal, dezvoltată cu **React** (frontend) și **Node.js/MongoDB** (backend). Aplicația include funcționalități pentru autentificare, gestionarea utilizatorilor (admin, jucători, manageri, staff), statistici și un design modern bazat pe o temă albastră.

---

## 1. Schema și structura utilizatorilor

- Am definit scheme MongoDB pentru utilizatori și datele asociate:
  - **User**: Conține `email`, `password`, `name`, `role` (`admin`, `player`, `manager`, `staff`), și referințe opționale (`playerId`, `managerId`, `staffId`).
  - **Player**, **Manager**, **Staff**: Scheme separate pentru date specifice (ex. `height` pentru jucători, `certifications` pentru staff).
- Am implementat o funcționalitate de ștergere în cascadă: la ștergerea unui utilizator, se șterg automat datele asociate (ex. `Player` referențiat prin `playerId`).

## 2. Autentificare și rute

- **Login**: O pagină simplă de autentificare cu un design modern (gradient albastru, card alb). Utilizatorii se autentifică cu email și parolă.
- **Rute protejate**:
  - `/admin/:id` pentru admini.
  - `/player/:id`, `/manager/:id`, `/staff/:id` pentru celelalte roluri.
  - Redirecționare automată la `/login` dacă utilizatorul nu este autentificat.

## 3. Pagini pentru roluri

- **PlayerPage**, **ManagerPage**, **StaffPage**:
  - Afișează detalii specifice fiecărui rol (ex. `height` pentru jucători, `certifications` pentru staff).
  - Include istoricul cluburilor și imaginea utilizatorului.
  - Am rezolvat o eroare de tip `undefined` în `StaffPage` prin verificări stricte.

## 4. Admin Page

- **Funcționalități**:
  - **Lista utilizatorilor**: Filtrabilă pe categorii (`admin`, `player`, `manager`, `staff`), cu opțiuni de ștergere.
  - **Adăugare utilizator**: Formular `UserForm` integrat, cu suport pentru toate rolurile.
  - **Statistici**: Grafic bar chart cu numărul de utilizatori pe categorii.
  - **Dashboard**: Afișează statistici simple (total utilizatori, jucători noi în ultima lună).
- **Design**:
  - Sidebar fix cu navigare (Dashboard, Utilizatori, Statistici, Adaugă utilizator).
  - Temă albastră (gradient `#022c5a` la `#3b82f6`), carduri albe cu colțuri rotunjite.
  - Logo-ul echipei „ProSport Club Since 2025” în sidebar și pe un tricou simulat.
  - Caseta de profil admin sub logo în sidebar.

## 5. Tricou simulat

- În secțiunea „Dashboard”, am adăugat un tricou de fotbal stilizat cu CSS:
  - Gradient albastru (`#022c5a` la `#3b82f6`).
  - Logo-ul decupat „ProSport Club Since 2025” plasat pe piept.
  - Mâneci și guler stilizate cu CSS.

## 6. Backend și API

- **Rute**:
  - `/api/users/add`: Adaugă utilizatori și date asociate.
  - `/api/users/delete`: Șterge utilizatori (cu ștergere în cascadă).
  - `/api/users/current`: Returnează datele utilizatorului curent (populate `playerId`, `managerId`, etc.).
- Middleware pentru upload imagini (`multer`) și hashing parole (`bcrypt`).

## 7. Stilizare și UX

- Designul este inspirat de pagina de login: gradient albastru, carduri albe, butoane albastre (`#1e3a8a` cu hover `#3b82f6`).
- Sidebar-ul include logo și caseta de profil admin.
- Am folosit CSS pur, fără framework-uri, pentru flexibilitate.

---

## Următorii pași sugerați

- Adăugare buton „Logout” în sidebar.
- Funcționalitate de editare utilizatori direct din listă.
- Secțiune „Acțiuni recente” pentru a urmări activitatea adminilor.
- Filtru avansat pentru căutarea utilizatorilor după nume/email.
