# Fashion Project – Google Cloud Deployment

Tài liệu này mô tả **toàn bộ quy trình triển khai hệ thống Fashion Project lên Google Cloud Platform (GCP)**, bao gồm:

- Backend API
- Recommendation Service
- Admin Frontend
- Client Frontend
- Cloud SQL (MySQL)
- Google Cloud Storage (GCS)

---

## Tổng quan kiến trúc

Sau khi triển khai, hệ thống bao gồm:

- **Cloud Run**
  - `fashion-backend`
  - `recommend-service`
  - `fashion-admin`
  - `fashion-client`
- **Cloud SQL (MySQL 8.0)**: lưu trữ dữ liệu nghiệp vụ
- **Google Cloud Storage**: lưu ảnh và tài nguyên tĩnh
- **Cloud Build**: build container từ source code

---

## Yêu cầu

- Đã cài đặt **Google Cloud SDK (gcloud)**
- Tài khoản Google có quyền tạo project
- Đã clone source code của Fashion Project

---

## Deployment Script

> ⚠️ Chạy các lệnh theo đúng thứ tự  
> 💡 Toàn bộ script bên dưới có thể copy & chạy từng bước

# ==============================
# Fashion Project - GCP Deploy
# ==============================

# --------------------------------------------------
# 1. Login Google Cloud
# --------------------------------------------------
# Đăng nhập tài khoản Google để gcloud có quyền thao tác
gcloud auth login


# --------------------------------------------------
# 2. Create & set project
# --------------------------------------------------
# Tạo project mới trên GCP
gcloud projects create fashion-project-4411 --name=fashion-project-4411

# Set project mặc định cho các lệnh tiếp theo
gcloud config set project fashion-project-4411


# --------------------------------------------------
# 3. Enable required services
# --------------------------------------------------
# Bật các service cần thiết cho hệ thống
gcloud services enable \
  run.googleapis.com \
  artifactregistry.googleapis.com \
  cloudbuild.googleapis.com \
  sqladmin.googleapis.com \
  storage.googleapis.com


# --------------------------------------------------
# 4. Create Cloud SQL (MySQL)
# --------------------------------------------------
# Tạo Cloud SQL MySQL 8.0
gcloud sql instances create fashion-mysql \
  --database-version=MYSQL_8_0 \
  --cpu=1 \
  --memory=4GB \
  --region=us-central1 \
  --root-password=123456


# --------------------------------------------------
# 5. Create database
# --------------------------------------------------
# Tạo database chính cho ứng dụng
gcloud sql databases create fashion_app \
  --instance=fashion-mysql


# --------------------------------------------------
# 6. Create DB user
# --------------------------------------------------
# Tạo user riêng cho backend (không dùng root)
gcloud sql users create fashion \
  --instance=fashion-mysql \
  --password=Hoang@1234


# --------------------------------------------------
# 7. Create Cloud Storage bucket
# --------------------------------------------------
# Bucket dùng để lưu ảnh và tài nguyên tĩnh
gsutil mb -l us-central1 gs://fashion-project-4411

# Cho phép public read ảnh
gsutil iam ch allUsers:objectViewer gs://fashion-project-4411


# --------------------------------------------------
# 8. Upload initial data
# --------------------------------------------------
# Upload file SQL seed
gsutil cp database/schema_seed.sql gs://fashion-project-4411/schema_seed.sql

# Upload ảnh sản phẩm
gsutil -m cp -r backend/src/main/resources/static/images gs://fashion-project-4411


# --------------------------------------------------
# 9. Deploy Backend API
# --------------------------------------------------
gcloud run deploy fashion-backend \
  --region us-central1 \
  --source backend \
  --clear-base-image \
  --add-cloudsql-instances=fashion-project-4411:us-central1:fashion-mysql \
  --set-env-vars DB_USERNAME=fashion,DB_PASSWORD=Hoang@1234,GCS_BUCKET_NAME=fashion-project-4411 \
  --allow-unauthenticated \
  --memory 2Gi \
  --cpu 2 \
  --timeout 300


# --------------------------------------------------
# 10. Deploy Recommendation Service
# --------------------------------------------------
gcloud run deploy recommend-service \
  --source recommendationsystem \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars BACKEND_URL=https://fashion-backend-1010294357760.us-central1.run.app


# --------------------------------------------------
# 11. Deploy Admin Frontend
# --------------------------------------------------
gcloud run deploy fashion-admin \
  --source frontend/AdminFe \
  --region us-central1 \
  --allow-unauthenticated \
  --set-build-env-vars VITE_BACKEND_URL=https://fashion-backend-1010294357760.us-central1.run.app


# --------------------------------------------------
# 12. Deploy Client Frontend
# --------------------------------------------------
gcloud run deploy fashion-client \
  --source frontend/ClientFe \
  --region us-central1 \
  --allow-unauthenticated \
  --set-build-env-vars VITE_BACKEND_URL=https://fashion-backend-1010294357760.us-central1.run.app


# --------------------------------------------------
# DONE
# --------------------------------------------------
echo "✅ Deployment completed successfully"
