# Fashion Project – Google Cloud Deployment

Tài liệu này mô tả **toàn bộ quy trình triển khai Fashion Project lên Google Cloud Platform (GCP)**, kèm giải thích **ngay tại từng lệnh** để dễ đọc, dễ hiểu và dễ bảo trì.

> ⚠️ Lưu ý
>
> * Giữ nguyên thứ tự chạy lệnh
> * Thay đổi mật khẩu và project id khi dùng thực tế
> * Không commit thông tin nhạy cảm lên repository
🌐 URL triển khai

Admin Frontend (AdFe): https://fashion-admin-1010294357760.us-central1.run.app

Client Frontend (ClientFe): https://fashion-client-1010294357760.us-central1.run.app

🔐 Tài khoản demo

Admin (AdFe)
```bash
Tài khoản: andmin
Mật khẩu: admin
```
Client (ClientFe)
```bash
Tài khoản: hoang
Mật khẩu: hoang
```

## 1. Xác thực & cấu hình Project

```bash
// Đăng nhập
gcloud auth login
# Mở trình duyệt để đăng nhập Google, cấp quyền cho gcloud CLI thao tác với GCP

// tạo dự án | id dự án | tên dự án
gcloud projects create fashion-project-4411 --name=fashion-project-4411
# Tạo một GCP Project mới – nơi quản lý toàn bộ tài nguyên (Cloud Run, SQL, Storage…)

// chọn dự án
gcloud config set project fashion-project-4411
# Đặt project này làm mặc định cho các lệnh gcloud tiếp theo
```

---

## 2. Bật các dịch vụ cần thiết

```bash
// bật quyền cloud run | build image | CI/CD | SQL | storage
gcloud services enable run.googleapis.com artifactregistry.googleapis.com cloudbuild.googleapis.com sqladmin.googleapis.com storage.googleapis.com
# Bật các API cần thiết để deploy Cloud Run, build container, dùng MySQL và Cloud Storage
```

---

## 3. Tạo Cloud SQL (MySQL)

```bash
// tạo Cloud SQL MySQL
gcloud sql instances create fashion-mysql --database-version=MYSQL_8_0 --cpu=1 --memory=4GB --region=us-central1 --project=fashion-project-4411 --root-password="123456"
# Tạo MySQL 8.0 instance trên GCP với 1 CPU, 4GB RAM tại region us-central1

// tạo database
gcloud sql databases create fashion_app --instance=fashion-MySQL
# Tạo database chính cho ứng dụng backend

// tạo user truy cập database
gcloud sql users create fashion --instance=fashion-mysql --password="Hoang@1234"
# Tạo user MySQL riêng cho backend (không dùng user root để tăng bảo mật)
```

---

## 4. Chuẩn bị & import database

```bash
// upload file SQL lên Cloud Storage
gsutil cp database/schema_seed.sql gs://fashion-project-4411/schema_seed.sql
# Upload file schema + seed data lên Cloud Storage để phục vụ import vào Cloud SQL
```

---

## 5. Cloud Storage – lưu trữ ảnh

```bash
// tạo bucket lưu ảnh
gsutil mb -l us-central1 gs://fashion-project-4411
# Tạo Cloud Storage bucket cùng region với backend để giảm độ trễ

// cho phép public đọc ảnh
gsutil iam ch allUsers:objectViewer gs://fashion-project-4411
# Cho phép frontend truy cập ảnh trực tiếp (public read-only)

// upload ảnh sản phẩm
gsutil -m cp -r backend\src\main\resources\static\images gs://fashion-project-4411
# Upload toàn bộ ảnh sản phẩm lên bucket (-m: copy song song để nhanh hơn)
```

---

## 6. Deploy Backend (Cloud Run)

```bash
// deploy backend
gcloud run deploy fashion-backend --region us-central1 --project fashion-project-4411 --source backend --clear-base-image --add-cloudsql-instances=fashion-project-4411:us-central1:fashion-mysql --set-env-vars="DB_USERNAME=fashion,DB_PASSWORD=Hoang@1234,GCS_BUCKET_NAME=fashion-project-4411" --allow-unauthenticated --memory 2Gi --cpu 2 --timeout 300
# Build container từ source backend, deploy lên Cloud Run,
# kết nối Cloud SQL và truyền biến môi trường cho ứng dụng
```

---

## 7. Deploy Recommendation Service

```bash
// deploy recommendation service
gcloud run deploy recommend-service --source recommendationsystem --region us-central1 --allow-unauthenticated --set-env-vars BACKEND_URL=https://fashion-backend-1010294357760.us-central1.run.app
# Deploy service AI / recommendation độc lập,
# sử dụng BACKEND_URL để gọi API từ backend chính
```

---

## 8. Deploy Frontend Admin

```bash
// deploy admin frontend
gcloud run deploy fashion-admin --source frontend/AdFe --region us-central1 --project fashion-project-4411 --allow-unauthenticated --set-build-env-vars VITE_BACKEND_URL=https://fashion-backend-1010294357760.us-central1.run.app
# Build frontend Admin (Vite) với backend URL được inject tại build time
```

---

## 9. Deploy Frontend Client

```bash
// deploy client frontend
gcloud run deploy fashion-client --source frontend/ClientFe --region us-central1 --project fashion-project-4411 --allow-unauthenticated --set-build-env-vars VITE_BACKEND_URL=https://fashion-backend-1010294357760.us-central1.run.app
# Build frontend cho người dùng cuối và deploy dưới dạng Cloud Run service
```

---

## 10. Hoàn tất

Sau khi hoàn thành:

* Backend, Frontend và Recommendation Service chạy trên **Cloud Run**
* Database chạy trên **Cloud SQL (MySQL)**
* Ảnh được lưu trên **Cloud Storage** và truy cập công khai

README này phù hợp cho **đồ án, báo cáo triển khai và môi trường production cơ
