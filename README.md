# Fashion Project – Google Cloud Deployment

Tài liệu này hướng dẫn triển khai toàn bộ hệ thống **Fashion Project** lên Google Cloud Platform (GCP).

> ⚠️ Lưu ý:
>
> - Thay toàn bộ các giá trị dạng `<PLACEHOLDER>` bằng thông tin thật của bạn
> - Không commit thông tin nhạy cảm (password, URL thật)

---

## Deployment Script

```bash
# ==============================
# Fashion Project - GCP Deploy
# ==============================

# ---------
# 1. Login
# ---------
gcloud auth login

# ----------------------
# 2. Create & set project
# ----------------------
PROJECT_ID=<PROJECT_ID>
PROJECT_NAME=<PROJECT_NAME>

gcloud projects create $PROJECT_ID --name=$PROJECT_NAME
gcloud config set project $PROJECT_ID

# -------------------------
# 3. Enable required services
# -------------------------
gcloud services enable \
  run.googleapis.com \
  artifactregistry.googleapis.com \
  cloudbuild.googleapis.com \
  sqladmin.googleapis.com \
  storage.googleapis.com

# ---------------------
# 4. Create Cloud SQL
# ---------------------
SQL_INSTANCE_NAME=<SQL_INSTANCE_NAME>
DB_ROOT_PASSWORD=<DB_ROOT_PASSWORD>

gcloud sql instances create $SQL_INSTANCE_NAME \
  --database-version=MYSQL_8_0 \
  --cpu=1 \
  --memory=4GB \
  --region=us-central1 \
  --project=$PROJECT_ID \
  --root-password="$DB_ROOT_PASSWORD"

# ----------------
# 5. Create database
# ----------------
DB_NAME=<DB_NAME>

gcloud sql databases create $DB_NAME \
  --instance=$SQL_INSTANCE_NAME

# ----------------
# 6. Create DB user
# ----------------
DB_USERNAME=<DB_USERNAME>
DB_PASSWORD=<DB_PASSWORD>

gcloud sql users create $DB_USERNAME \
  --instance=$SQL_INSTANCE_NAME \
  --password="$DB_PASSWORD"

# -------------------------
# 7. Upload SQL seed to GCS
# -------------------------
GCS_BUCKET_NAME=<GCS_BUCKET_NAME>

gsutil cp database/schema_seed.sql gs://$GCS_BUCKET_NAME/schema_seed.sql

# --------------------------------
# 8. Create GCS bucket & upload images
# --------------------------------
gsutil mb -l us-central1 gs://$GCS_BUCKET_NAME
gsutil iam ch allUsers:objectViewer gs://$GCS_BUCKET_NAME
gsutil -m cp -r backend/src/main/resources/static/images gs://$GCS_BUCKET_NAME

# ----------------
# 9. Deploy Backend
# ----------------
BACKEND_SERVICE_NAME=<BACKEND_SERVICE_NAME>

gcloud run deploy $BACKEND_SERVICE_NAME \
  --region us-central1 \
  --project $PROJECT_ID \
  --source backend \
  --clear-base-image \
  --add-cloudsql-instances=$PROJECT_ID:us-central1:$SQL_INSTANCE_NAME \
  --set-env-vars="DB_USERNAME=$DB_USERNAME,DB_PASSWORD=$DB_PASSWORD,GCS_BUCKET_NAME=$GCS_BUCKET_NAME" \
  --allow-unauthenticated \
  --memory 2Gi \
  --cpu 2 \
  --timeout 300

# ----------------------------
# 10. Deploy Recommendation Service
# ----------------------------
RECOMMEND_SERVICE_NAME=<RECOMMEND_SERVICE_NAME>
BACKEND_URL=<BACKEND_URL>

gcloud run deploy $RECOMMEND_SERVICE_NAME \
  --source recommendationsystem \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars BACKEND_URL=$BACKEND_URL

# ----------------
# 11. Deploy Admin Frontend
# ----------------
ADMIN_SERVICE_NAME=<ADMIN_SERVICE_NAME>

gcloud run deploy $ADMIN_SERVICE_NAME \
  --source frontend/AdminFe \
  --region us-central1 \
  --project $PROJECT_ID \
  --allow-unauthenticated \
  --set-build-env-vars VITE_BACKEND_URL=$BACKEND_URL

# ----------------
# 12. Deploy Client Frontend
# ----------------
CLIENT_SERVICE_NAME=<CLIENT_SERVICE_NAME>

gcloud run deploy $CLIENT_SERVICE_NAME \
  --source frontend/ClientFe \
  --region us-central1 \
  --project $PROJECT_ID \
  --allow-unauthenticated \
  --set-build-env-vars VITE_BACKEND_URL=$BACKEND_URL

# ----------------
# DONE
# ----------------
echo "Deployment completed"
```
