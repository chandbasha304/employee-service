pipeline {
    agent any

    triggers {
        githubPush()
        pollSCM('H/2 * * * *')
    }

    environment {
        PROJECT_ID = 'prefab-lamp-498812-u8'
        REGION = 'us-central1'
        REPOSITORY = 'ems-repo'
        IMAGE_NAME = 'ems-frontend'
        IMAGE = "${REGION}-docker.pkg.dev/${PROJECT_ID}/${REPOSITORY}/${IMAGE_NAME}:latest"
    }

    stages {
        stage('Checkout') {
            steps {
                echo '=== Checkout Started ==='

                git url: 'https://github.com/chandbasha304/employee-service.git',
                    branch: 'main'

                echo '=== Checkout Completed ==='
            }
        }

        stage('Run Tests') {
            steps {
                echo '=== Running Frontend Unit Tests ==='
                sh '''
                    npm install
                    npm run test
                '''
            }
        }

        stage('Build Application') {
            steps {
                echo '=== Building Angular Application ==='
                sh '''
                    npm run build
                '''
            }
        }

        stage('Build Docker Image') {
            steps {
                echo '=== Docker Build Started ==='

                // Build at the root folder since package.json and Dockerfile are at the root
                sh '''
                    docker build -t ${IMAGE} .
                '''

                echo '=== Docker Build Completed ==='
            }
        }

        stage('Authenticate Artifact Registry') {
            steps {
                echo '=== Artifact Registry Authentication Started ==='

                sh '''
                    gcloud auth configure-docker us-central1-docker.pkg.dev --quiet
                '''

                echo '=== Artifact Registry Authentication Completed ==='
            }
        }

        stage('Push Image') {
            steps {
                echo '=== Push Started ==='

                sh '''
                    docker push ${IMAGE}
                '''

                echo '=== Push Completed ==='
            }
        }

        stage('Deploy') {
            steps {
                echo '=== Deployment Started ==='

                sh '''
                    # 1. Create a custom docker network if it doesn't already exist
                    docker network create ems-network || true

                    docker pull ${IMAGE}

                    docker stop ems-frontend || true
                    docker rm ems-frontend || true

                    # 2. Run the container on the custom network and expose port 3000
                    docker run -d \
                        --name ems-frontend \
                        --network ems-network \
                        -p 3000:80 \
                        ${IMAGE}

                    docker ps
                '''

                echo '=== Deployment Completed ==='
            }
        }
    }

    post {
        success {
            echo '====================================='
            echo 'PIPELINE EXECUTED SUCCESSFULLY'
            echo '====================================='
        }

        failure {
            echo '====================================='
            echo 'PIPELINE FAILED'
            echo '====================================='
        }

        always {
            echo '====================================='
            echo 'PIPELINE FINISHED'
            echo '====================================='
        }
    }
}
