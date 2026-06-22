# CI/CD Deployment Guide: Jenkins & GCP Native Cloud Build

This guide details how to implement automated CI/CD pipelines for your Angular frontend and Java Spring Boot backend using:
1. **Jenkins (Declarative Pipeline)**
2. **Google Cloud Build (GCP Native Alternative)**

---

## Approach 1: Jenkins Declarative Pipeline

This pipeline builds both the Angular app and the Spring Boot backend, packages them into Docker images, pushes them to Google Artifact Registry, and deploys them to your GCP VM.

### Prerequisites in Jenkins:
1. **Plugins**: Install the `Pipeline`, `Docker Pipeline`, and `SSH Agent` plugins.
2. **Credentials**:
   - `gcp-service-account-key` (Secret File containing your GCP Service Account JSON key for Artifact Registry authorization).
   - `vm-ssh-credentials` (SSH Username with private key credentials to access your `ems-backend-vm`).

### The `Jenkinsfile`
Create a file named `Jenkinsfile` in the root of your repository:

```groovy
pipeline {
    agent any

    environment {
        // GCP details
        PROJECT_ID = 'prefab-lamp-498812-u8'
        REGION = 'us-central1'
        REGISTRY = "us-central1-docker.pkg.dev/${PROJECT_ID}/ems-repo"
        
        // Image names
        FRONTEND_IMAGE = "${REGISTRY}/ems-frontend:latest"
        BACKEND_IMAGE = "${REGISTRY}/ems-backend:latest"
        
        // VM deployment details
        VM_USER = 'bashasoft304'
        VM_IP = '35.188.72.127'
    }

    stages {
        stage('Checkout Code') {
            steps {
                checkout scm
            }
        }

        stage('Build & Package Backend') {
            steps {
                dir('ems-spanner/ems') { // Path to Java backend root
                    sh 'chmod +x mvnw'
                    sh './mvnw clean package -DskipTests'
                }
            }
        }

        stage('Build Docker Images') {
            steps {
                script {
                    // Build backend image
                    sh "docker build -t ${BACKEND_IMAGE} ./ems-spanner/ems"
                    
                    // Build frontend image
                    sh "docker build -t ${FRONTEND_IMAGE} ./employee-management-ui"
                }
            }
        }

        stage('Push to Google Artifact Registry') {
            steps {
                withCredentials([file(credentialsId: 'gcp-service-account-key', variable: 'GCP_KEY')]) {
                    sh """
                        # Authenticate Docker with GCP Service Account
                        cat ${GCP_KEY} | docker login -u _json_key --password-stdin https://us-central1-docker.pkg.dev
                        
                        # Push both images
                        docker push ${BACKEND_IMAGE}
                        docker push ${FRONTEND_IMAGE}
                    """
                }
            }
        }

        stage('Deploy to GCP VM') {
            steps {
                sshagent(['vm-ssh-credentials']) {
                    sh """
                        # Copy docker-compose.yml and .env files to the VM
                        scp -o StrictHostKeyChecking=no ./employee-management-ui/docker-compose.yml ./employee-management-ui/.env ${VM_USER}@${VM_IP}:~/ems-deployment/
                        
                        # Command the VM to pull and deploy
                        ssh -o StrictHostKeyChecking=no ${VM_USER}@${VM_IP} "
                            cd ~/ems-deployment
                            docker-compose pull
                            docker-compose down
                            docker-compose up -d
                        "
                    """
                }
            }
        }
    }

    post {
        success {
            echo "Deployment successful! Visit http://${VM_IP}:3000"
        }
        failure {
            echo "Pipeline failed. Please inspect build console logs."
        }
    }
}
```

---

## Approach 2: GCP Native CI/CD (Cloud Build)

If you want a **serverless, fully managed alternative** in Google Cloud without maintaining a Jenkins server, you can use **GCP Cloud Build**.

### How it works:
1. Connect your Git Repository (GitHub/GitLab) directly to Google Cloud Build.
2. Define a `cloudbuild.yaml` file in the root of your project.
3. Cloud Build triggers automatically on git push, builds the images, pushes them to Artifact Registry, and deploys them to Compute Engine.

### The `cloudbuild.yaml`
```yaml
steps:
  # 1. Build Backend Image
  - name: 'gcr.io/cloud-builders/docker'
    args: ['build', '-t', 'us-central1-docker.pkg.dev/prefab-lamp-498812-u8/ems-repo/ems-backend:latest', './ems-spanner/ems']

  # 2. Build Frontend Image
  - name: 'gcr.io/cloud-builders/docker'
    args: ['build', '-t', 'us-central1-docker.pkg.dev/prefab-lamp-498812-u8/ems-repo/ems-frontend:latest', './employee-management-ui']

  # 3. Push Backend Image
  - name: 'gcr.io/cloud-builders/docker'
    args: ['push', 'us-central1-docker.pkg.dev/prefab-lamp-498812-u8/ems-repo/ems-backend:latest']

  # 4. Push Frontend Image
  - name: 'gcr.io/cloud-builders/docker'
    args: ['push', 'us-central1-docker.pkg.dev/prefab-lamp-498812-u8/ems-repo/ems-frontend:latest']

  # 5. Remote SSH Deploy to VM using gcloud SSH utility
  - name: 'gcr.io/google.com/cloudsdktool/cloud-sdk'
    entrypoint: 'bash'
    args:
      - '-c'
      - |
        gcloud compute ssh bashasoft304@ems-backend-vm \
          --zone=us-central1-a \
          --command="cd ~/ems-deployment && docker-compose pull && docker-compose down && docker-compose up -d"

images:
  - 'us-central1-docker.pkg.dev/prefab-lamp-498812-u8/ems-repo/ems-backend:latest'
  - 'us-central1-docker.pkg.dev/prefab-lamp-498812-u8/ems-repo/ems-frontend:latest'
```

---

### Comparison of the two approaches:

| Feature | Jenkins | GCP Cloud Build (Native) |
| :--- | :--- | :--- |
| **Hosting** | You must host/maintain the Jenkins server. | Fully serverless (managed by Google). |
| **IAM Security** | Needs credentials to be manually added. | Integrates natively with GCP Service Accounts and IAM permissions. |
| **Triggering** | Git Webhooks or Polling. | Automated Google Developer triggers on git commits. |
| **Cost** | Cost of running the Jenkins VM/Server. | Pay-per-minute of build execution time (First 120 build-minutes per day are free). |
| **Integration** | Plugin-based. | Built directly into GCP Console & Artifact Registry. |
