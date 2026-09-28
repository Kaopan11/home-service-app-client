# โครงสร้างโค้ด HomeServices

เอกสารนี้สรุปโครงสร้างและ logic ของระบบทั้งสอง repo

- Frontend: `home-service-app-client` — Vue 3 + TypeScript + Vite + Pinia + Vue Router
- Backend: `home-service-app-server` — Spring Boot + JPA + Supabase Auth / Postgres

ฐานข้อมูลอยู่ที่ Supabase การล็อกอินใช้ Supabase Auth การชำระเงินใช้ Omise

## ภาพรวมการทำงาน

```text
หน้า Vue
  → router (ตรวจ role ก่อนเข้าหน้า)
  → Pinia store / service function
  → apiFetch() ส่ง Bearer token ไปที่ VITE_API_BASE_URL (ค่าเริ่มต้น http://localhost:8080)
  → JwtAuthFilter อ่าน JWT
  → Controller
  → Service (ตรวจ role และ business rule)
  → Repository / JPA
  → Postgres
```

`App.vue` มีแค่ `<RouterView />` ทุกหน้าถูกโหลดแบบ lazy จาก `src/router/index.ts`

ก่อนเข้าทุก route `router.beforeEach` เรียก `auth.restoreSession()` อ่าน token จาก localStorage ถ้าหมดอายุจะล้าง session แล้วตัดสินตาม meta ของ route

| meta | เงื่อนไข | ถ้าไม่ผ่าน |
| --- | --- | --- |
| `public` | ใครก็เข้าได้ | — |
| `requiresAuth` | มี session | ไป `/login?redirect=` |
| `requiresAdmin` | role เป็น `ADMIN` | ไป `/admin/login` |
| `requiresTechnician` | role เป็น `TECHNICIAN` | ไป `/login` |

ฝั่ง server `SecurityConfig` เป็น stateless ไม่ใช้ session ของ Spring เส้นทางสาธารณะมี health, login, register, logout, Facebook และ `GET /api/services` ที่เหลือต้องมี JWT ที่ parse ได้ สิทธิ์ `ADMIN` / `TECHNICIAN` ไม่ได้ล็อกที่ filter แต่ตรวจใน service ด้วย `UserService.requireAdmin()` และ `requireCurrentTechnician()`

`apiFetch` ใน `src/services/api.ts` ใส่ `Authorization: Bearer <token>` ให้ทุก request ถ้าได้ 401 จะล้าง session แล้วส่งแอดมินกลับ `/admin/login` หรือส่งลูกค้าที่อยู่หน้าต้องล็อกอินกลับ `/login`

## บทบาทผู้ใช้

`UserRole` มีสามค่า

- `USER` — ลูกค้า สมัครเองหรือเข้าด้วย Facebook ได้ role นี้
- `ADMIN` — จัดการหมวดหมู่ บริการ โปรโมชัน และเห็นกระดิ่งแจ้งเตือน
- `TECHNICIAN` — รับงานซ่อมและตั้งค่าบัญชีช่าง

ล็อกอินลูกค้าใช้ `auth.loginCustomer()` ล็อกอินแอดมินใช้ `auth.login()` ซึ่งรับเฉพาะ role `ADMIN` ถ้าไม่ใช่จะล้าง session ทันที

## โมเดลข้อมูลหลัก

| ตาราง / entity | ความหมาย |
| --- | --- |
| `users` | บัญชีในแอป `public_id` ตรงกับ user ของ Supabase Auth |
| `categories` | หมวดหมู่บริการ |
| `service_items` + `service_option_items` | บริการและตัวเลือกราคา (หน่วย, ราคา) |
| `promotions` | โค้ดส่วนลดของแอดมิน |
| `orders`, `order_items`, `order_assignments` | คำสั่งซ่อมที่ลูกค้าเห็นในรายการและประวัติ |
| `service_jobs` | คำขอที่ช่างเห็นในคิวรอรับงาน สถานะ `WAITING_ACCEPT`, `ACCEPTED`, `COMPLETED`, `CANCELLED` |
| `technician_profiles` | ที่อยู่ พิกัด สถานะพร้อมรับงาน และบริการที่ช่างรับ |
| `technician_job_declines` | งานที่ช่างคนนั้นกดปฏิเสธ จะไม่โชว์ในคิวของเขาอีก |
| `notifications` | แจ้งเตือนในแอป ประเภท `JOB_CREATED`, `JOB_ACCEPTED`, `JOB_COMPLETED`, `JOB_CANCELLED` |

`orders` กับ `service_jobs` เป็นคนละชุดข้อมูล หน้ารายการคำสั่งซ่อมของลูกค้าอ่านจาก `orders` คิวของช่างอ่านจาก `service_jobs`

## Flow หลัก

### 1. สมัครและเข้าสู่ระบบ

1. ลูกค้ากรอกฟอร์มที่ `/register` หรือกด Facebook ที่ `/login`
2. สมัครด้วยอีเมล: `AuthService.register` ตรวจอีเมลและเบอร์ซ้ำ สร้าง user ใน Supabase Auth แล้วสร้างแถว `users` ด้วย role `USER` ถ้าบันทึกแถวไม่สำเร็จจะลบ user ฝั่ง Supabase ทิ้ง แล้วล็อกอินทันทีเพื่อได้ token
3. ล็อกอินด้วยรหัสผ่าน: หา user จากอีเมล แล้วให้ Supabase ตรวจรหัสผ่าน คืน access token, refresh token, `expiresAt`
4. Facebook: frontend เปิด URL จาก `GET /api/auth/facebook` หลัง Supabase พากลับมาที่ `/auth/callback` หน้านี้ส่ง access token ให้ `POST /api/auth/facebook` server ตรวจ JWT แล้วหา user จาก `public_id` หรืออีเมล ถ้าไม่เจอจะสร้าง user ใหม่ role `USER`
5. Frontend เก็บ session ใน localStorage ผ่าน `authStorage.ts`

เปลี่ยนรหัสผ่านที่ `/profile/password` server ล็อกอินด้วยรหัสปัจจุบันก่อน แล้วค่อย `updatePassword` ที่ Supabase รหัสใหม่ต้องยาวอย่างน้อย 6 ตัวและไม่ซ้ำรหัสเดิม

### 2. จองบริการและชำระเงิน

ขั้นตอนนี้อยู่คนละหน้าแต่ใช้ draft เดียวกันใน `stores/booking.ts` draft ถูกเขียนลง `sessionStorage` คีย์ `home_services_booking_draft` รีเฟรชแล้วยังอยู่ ปิดแท็บแล้วหาย

1. `/service` เรียก `GET /api/services` แล้วกรองชื่อ หมวด ช่วงราคา และเรียงลำดับในเบราว์เซอร์ ถ้า API ล้มจะโชว์ข้อความแล้วใส่รายการตัวอย่างจาก `src/data/services.ts`
2. `/service/:id` เรียก `GET /api/services/{id}` ถ้าไม่เจอหรือ error จะลอง mock ใน `src/data/serviceDetails.ts` ผู้ใช้เพิ่มจำนวนตัวเลือกด้วย `useBooking` ปุ่มดำเนินการต่อจะกดได้เมื่อมีอย่างน้อย 1 รายการ
3. กดดำเนินการต่อแล้ว `bookingStore.setSelection()` เก็บรหัสบริการ ชื่อ รูป รายการ และราคารวม ถ้ายังไม่ล็อกอินจะไป `/login?redirect=` กลับมาที่ `/service/:id/info`
4. หน้า info ต้องมี draft ของบริการนั้น ไม่งั้นถูกส่งกลับหน้ารายละเอียด ที่อยู่ว่างจะถูกเติมจากโปรไฟล์ ฟอร์มบังคับวัน เวลา ที่อยู่ จังหวัด เขต แขวง หมายเหตุไม่บังคับ เปลี่ยนจังหวัดหรือเขตแล้วตัวเลือกถัดไปจะถูกเคลียร์ถ้าค่าเดิมใช้ไม่ได้ ข้อมูลที่อยู่มาจาก `src/data/thaiAddress.ts` ไม่ได้เรียก API
5. ผ่าน validation แล้วเลื่อน stepper เป็นขั้นที่ 3 ในหน้าเดียวกัน
6. ชำระได้เฉพาะบัตร บัตรถูกตรวจความยาว Luhn ชื่อ วันหมดอายุ และ CVV ในเบราว์เซอร์ พร้อมเพย์ถูกปิดไว้ กดยืนยันแล้ว `createCardToken` ส่งข้อมูลบัตรไป Omise โดยตรง ได้ token กลับมา จากนั้น `POST /api/charges` พร้อม token และยอดบาท
7. `PaymentService` แปลงบาทเป็นสตางค์ เรียก Omise สร้าง charge ต้อง `paid = true` และ `status = successful` ไม่งั้นโยน `PaymentFailedException`
8. สำเร็จแล้ว frontend ล้าง draft และโชว์หน้าขอบคุณ

การคิดเงินรอบนี้ยังไม่สร้างแถว `orders` หรือ `service_jobs` โค้ดโปรโมชันในหน้าชำระเงินแค่ตั้งธงใน UI ยังไม่เรียก API ส่วนลด

### 3. โปรไฟล์และรายการของลูกค้า

- `/profile` โหลดและแก้ชื่อ เบอร์ ที่อยู่ ผ่าน `GET/PUT/PATCH /api/users/me`
- `/orders` เรียก `GET /api/orders?scope=active` แสดงออเดอร์ที่สถานะยังไม่จบ
- `/history` ใช้หน้าเดียวกัน แต่ `scope=history` แสดงเฉพาะสถานะจบ

`CustomerOrderService` แปลงสถานะดิบเป็นสามค่าที่ UI ใช้

- จบ: `done`, `completed`, `complete`, `success`, `successful`
- กำลังทำ: `progress`, `in_progress`, `processing`, `accepted`, `assigned`, `ongoing`
- ที่เหลือเป็น `pending`

วันเวลาแสดงเป็นพุทธศักราช เขต `Asia/Bangkok` ประวัติใช้เวลาที่งานเสร็จก่อน รายการที่ยังไม่จบใช้เวลานัด

### 4. แอดมิน

ทุก endpoint ใต้ `/api/admin/**` เรียก `requireAdmin()` ก่อนทำงาน

- หมวดหมู่: list, detail, สร้าง, แก้, ลบ ที่ `/admin/categories`
- บริการ: list และฟอร์มเพิ่ม/แก้ชื่อกับหมวดหมู่ ที่ `/admin/services` สร้างและแก้ใช้ `POST` / `PATCH /api/admin/services`
- โปรโมชัน: list, detail, สร้าง, แก้, ลบ ที่ `/admin/promos` ถ้า API โปรโมชันใช้ไม่ได้ frontend ใน `promoApi.ts` จะสลับไปใช้ข้อมูลจำลองในหน่วยความจำ
- กระดิ่งใน `AdminLayout` เรียก `GET /api/notifications` และ `GET /api/notifications/unread-count` กดรายการแล้ว `PATCH /api/notifications/{id}/read`

ตอนนี้ event ที่ถูกเขียนแจ้งเตือนจริงมีตอนช่างกดรับงาน (`JOB_ACCEPTED`) ส่งให้ลูกค้าเจ้าของงาน

### 5. ช่าง

1. `/technician` เด้งไป `/technician/requests`
2. หน้านี้โหลด `GET /api/technician/account` ถ้า `available = false` จะไม่ดึงคิว และมีปุ่มเปิดรับงาน
3. ถ้าพร้อมรับงาน เรียก `GET /api/technician/requests` server คืนเฉพาะงาน `WAITING_ACCEPT` ที่บริการตรงกับที่ช่างเลือกรับ และที่ช่างคนนี้ยังไม่เคยกดปฏิเสธ ถ้าโปรไฟล์ไม่พร้อมรับงานหรือยังไม่เลือกบริการ คิวจะว่าง
4. กดรับงานต้องยืนยันใน `AcceptJobConfirmation` แล้ว `POST /api/technician/requests/{id}/accept` server ล็อกงานให้ช่างคนนั้น เปลี่ยนสถานะเป็น `ACCEPTED` และแจ้งลูกค้า ถ้ามีคนรับไปแล้วจะได้ conflict
5. กดปฏิเสธจะบันทึก `technician_job_declines` งานยังคง `WAITING_ACCEPT` ให้ช่างคนอื่นเห็น
6. ปุ่มรีเฟรชตำแหน่งใช้ Geolocation ของเบราว์เซอร์ แล้ว `POST /api/technician/account/location` server reverse geocode เป็นที่อยู่
7. `/technician/account` แก้ชื่อ เบอร์ ที่อยู่ สถานะพร้อมรับงาน และบริการที่รับ
8. `/technician/jobs` และ `/technician/history` ยังเป็นหน้า placeholder

## หน้าฝั่ง Frontend

### ลูกค้า

| Route | ไฟล์ | ทำอะไร |
| --- | --- | --- |
| `/` | `pages/HomePage.vue` | หน้าแรก hero, บริการยอดฮิตจาก mock, แบนเนอร์รับสมัครช่าง |
| `/service` | `pages/ServiceList.vue` | รายการบริการจาก API พร้อมตัวกรอง |
| `/service/:id` | `pages/ServiceDetailPage.vue` | ขั้นที่ 1 เลือกจำนวนตัวเลือกและบันทึก draft |
| `/service/:id/info` | `pages/ServiceBookingInfoPage.vue` | ขั้นที่ 2 กรอกนัดหมาย ขั้นที่ 3 ชำระเงิน |
| `/login` | `pages/LoginPage.vue` | ล็อกอินอีเมลหรือ Facebook ถ้าล็อกอินอยู่แล้วจะเด้งตาม role |
| `/register` | `pages/RegisterPage.vue` | สมัครแล้วเข้าสู่ระบบทันที |
| `/auth/callback` | `pages/FacebookCallbackPage.vue` | รับ token จาก Supabase แล้วเรียก login Facebook |
| `/profile` | `pages/UserProfilePage.vue` | ดูและแก้โปรไฟล์ |
| `/profile/password` | `pages/ProfilePasswordPage.vue` | เปลี่ยนรหัสผ่าน |
| `/orders`, `/history` | `pages/UserOrdersPage.vue` | การ์ดคำสั่งซ่อม คนละ scope ตามชื่อ route |

ชิ้นส่วนที่ใช้ร่วมใน flow จอง

- `components/booking/BookingLayout.vue` — header, hero, stepper, แถบปุ่มล่าง
- `BookingOptionList.vue` — เพิ่มลดจำนวน
- `BookingInfoForm.vue` — วัน เวลา ที่อยู่
- `BookingPayment.vue` — ตรวจบัตรและเรียกเก็บเงิน
- `BookingSummary.vue` — รายการ วัน เวลา ที่อยู่ และยอดรวม
- `composables/useBooking.ts` — state จำนวนและราคารวมของขั้นที่ 1

### แอดมิน

layout ร่วมคือ `components/admin/AdminLayout.vue` มีเมนูและ `NotificationBell.vue`

| Route | ไฟล์ |
| --- | --- |
| `/admin/login` | `pages/admin/AdminLoginPage.vue` |
| `/admin/categories` | `pages/admin/categories/CategoryListPage.vue` |
| `/admin/categories/new` | `CategoryCreatePage.vue` |
| `/admin/categories/:id` | `CategoryDetailPage.vue` |
| `/admin/categories/:id/edit` | `CategoryEditPage.vue` |
| `/admin/services` | `pages/admin/AdminServicesPage.vue` |
| `/admin/services/new` และ `/:id/edit` | `pages/admin/AdminServiceFormPage.vue` |
| `/admin/promos` | `pages/admin/promos/PromoListPage.vue` |
| `/admin/promos/new` | `PromoCreatePage.vue` |
| `/admin/promos/:id` | `PromoDetailPage.vue` |
| `/admin/promos/:id/edit` | `PromoEditPage.vue` |

`AdminPlaceholderPage.vue` ยังอยู่ในโปรเจกต์ แต่ route บริการไม่ได้ใช้แล้ว

### ช่าง

layout ร่วมคือ `components/technician/TechnicianLayout.vue`

| Route | ไฟล์ | สถานะ |
| --- | --- | --- |
| `/technician/requests` | `TechnicianRequestsPage.vue` | ใช้งานได้ |
| `/technician/account` | `TechnicianAccountPage.vue` | ใช้งานได้ ถ้าโหลดโปรไฟล์ไม่สำเร็จจะใส่รายการบริการจำลอง |
| `/technician/jobs`, `/technician/history` | `TechnicianPlaceholderPage.vue` | ยังไม่มี logic |

## โฟลเดอร์ Frontend

| โฟลเดอร์ | หน้าที่ |
| --- | --- |
| `src/pages` | หนึ่งไฟล์ต่อหนึ่ง route |
| `src/components` | UI ที่ใช้ซ้ำ แยกตาม `booking`, `admin`, `home`, `layout`, `technician`, `ui`, `auth` |
| `src/services` | ฟังก์ชันเรียก API ไม่เก็บ state |
| `src/stores` | Pinia: `auth`, `booking`, `profile`, `technicianJobs` |
| `src/composables` | logic ที่ผูกกับหน้า เช่น จำนวนการจอง |
| `src/types` | type ของ request และ response |
| `src/data` | ข้อมูลคงที่และ mock ที่ยังถูกใช้เป็น fallback |
| `src/utils/authStorage.ts` | อ่านเขียน session ใน localStorage |
| `src/router/index.ts` | route และ guard |

Store ที่ควรรู้

- `auth` — user, token, login, logout, restore
- `booking` — draft การจองทั้งรายการและข้อมูลนัด เก็บใน sessionStorage
- `profile` — โปรไฟล์ลูกค้าที่ใช้เติมที่อยู่ในฟอร์มจอง
- `technicianJobs` — จำนวนงานรอรับที่โชว์บนเมนูช่าง

## แพ็กเกจ Backend

โค้ดอยู่ใต้ `com.team.home_service_app_server`

| แพ็กเกจ | หน้าที่ |
| --- | --- |
| `controller` | รับ HTTP แล้วส่งต่อ service |
| `service` | business rule |
| `repository` | JPA query |
| `entity` | ตาราง |
| `dto` | รูปแบบ request และ response |
| `security` | ตรวจ JWT และสร้าง principal |
| `config` | Security, CORS, Omise |
| `client` | เรียก Supabase Auth และ Omise |
| `exception` | แปลง error เป็น JSON |

Controller และเส้นทาง

| Controller | เส้นทาง |
| --- | --- |
| `HealthController` | `GET /`, `GET /health` |
| `AuthController` | `POST /api/auth/login`, `register`, `logout`, `facebook` และ `GET /api/auth/facebook` |
| `UserController` | `GET/PUT/PATCH /api/users/me`, `PATCH /api/users/me/password` |
| `ServiceController` | `GET /api/services`, `GET /api/services/{id}` สาธารณะ |
| `CustomerOrderController` | `GET /api/orders?scope=active\|history` |
| `PaymentController` | `POST /api/charges` |
| `NotificationController` | `GET /api/notifications`, `GET /unread-count`, `PATCH /{id}/read` |
| `AdminCategoryController` | CRUD `/api/admin/categories` |
| `AdminServiceController` | CRUD `/api/admin/services` |
| `AdminPromotionController` | CRUD `/api/admin/promotions` |
| `TechnicianProfileController` | `GET/PATCH /api/technician/account`, `POST /account/location` |
| `TechnicianJobController` | `GET /api/technician/requests`, `GET /pending-count`, `POST /{id}/accept`, `POST /{id}/decline` |

## จุดที่ยังไม่ครบ

- ชำระเงินสำเร็จแล้วแต่ยังไม่สร้างออเดอร์หรือคำขอให้ช่าง
- พร้อมเพย์และโค้ดส่วนลดบนหน้าชำระเงินยังไม่ต่อของจริง
- หน้าแรกและ fallback ของรายการบริการยังใช้ mock ใน `src/data`
- โปรโมชันแอดมินมีโหมด mock ใน `promoApi.ts` เมื่อ API ใช้ไม่ได้
- คิวงานที่ช่างรับแล้วและประวัติช่างยังเป็น placeholder
- ประเภทแจ้งเตือนมีสี่ค่า แต่จุดที่ยิงจริงตอนนี้คือ `JOB_ACCEPTED`
