// Đăng nhập
gcloud auth login
# Mở trình duyệt để đăng nhập Google, cấp quyền cho gcloud CLI


// tạo dự án | id dự án | tên dự án
gcloud projects create fashion-project-4411 --name=fashion-project-4411
# Tạo một GCP Project mới – nơi chứa toàn bộ Cloud Run, SQL, Storage


// chọn dự án
gcloud config set project fashion-project-4411
# Đặt project này làm mặc định cho các lệnh gcloud tiếp theo


// bật quyền cloud run | build image | CI/CD | SQL | storage
gcloud services enable run.googleapis.com artifactregistry.googleapis.com cloudbuild.googleapis.com sqladmin.googleapis.com storage.googleapis.com
# Bật các API cần thiết để deploy Cloud Run, build image, dùng MySQL và Cloud Storage


// tạo Cloud SQL MySQL
gcloud sql instances create fashion-mysql --database-version=MYSQL_8_0 --cpu=1 --memory=4GB --region=us-central1 --project=fashion-project-4411 --root-password="123456"
# Tạo MySQL 8.0 instance trên GCP với 1 CPU, 4GB RAM tại us-central1


// tạo database
gcloud sql databases create fashion_app --instance=fashion-MySQL
# Tạo database chính cho ứng dụng backend


// tạo user truy cập database
gcloud sql users create fashion --instance=fashion-mysql --password="Hoang@1234"
# Tạo user MySQL riêng cho backend (không dùng root)


// upload file SQL lên Cloud Storage
gsutil cp database/schema_seed.sql gs://fashion-project-4411/schema_seed.sql
# Đưa file SQL lên GCS để chuẩn bị import vào Cloud SQL


// tạo bucket lưu ảnh
gsutil mb -l us-central1 gs://fashion-project-4411
# Tạo Cloud Storage bucket cùng region với backend


// cho phép public đọc ảnh
gsutil iam ch allUsers:objectViewer gs://fashion-project-4411
# Cho frontend truy cập ảnh trực tiếp (public read)


// upload ảnh sản phẩm
gsutil -m cp -r backend\src\main\resources\static\images gs://fashion-project-4411
# Upload toàn bộ ảnh lên bucket (-m để copy song song, nhanh hơn)


// deploy backend
gcloud run deploy fashion-backend --region us-central1 --project fashion-project-4411 --source backend --clear-base-image --add-cloudsql-instances=fashion-project-4411:us-central1:fashion-mysql --set-env-vars="DB_USERNAME=fashion,DB_PASSWORD=Hoang@1234,GCS_BUCKET_NAME=fashion-project-4411" --allow-unauthenticated --memory 2Gi --cpu 2 --timeout 300
# Build + deploy backend lên Cloud Run, kết nối Cloud SQL và truyền biến môi trường


// deploy recommendation service
gcloud run deploy recommend-service --source recommendationsystem --region us-central1 --allow-unauthenticated --set-env-vars BACKEND_URL=https://fashion-backend-1010294357760.us-central1.run.app
# Deploy service AI/recommendation, gọi backend qua BACKEND_URL


// deploy admin frontend
gcloud run deploy fashion-admin --source frontend/AdFe --region us-central1 --project fashion-project-4411 --allow-unauthenticated --set-build-env-vars VITE_BACKEND_URL=https://fashion-backend-1010294357760.us-central1.run.app
# Build frontend admin (Vite) với backend URL được inject khi build


// deploy client frontend
gcloud run deploy fashion-client --source frontend/ClientFe --region us-central1 --project fashion-project-4411 --allow-unauthenticated --set-build-env-vars VITE_BACKEND_URL=https://fashion-backend-1010294357760.us-central1.run.app
# Build frontend người dùng cuối và deploy lên Cloud Run
