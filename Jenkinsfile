pipeline {

    agent any

    environment {
        IMAGE_NAME = "surajsdm/hello-node"
        IMAGE_TAG  = "${BUILD_NUMBER}"
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install Dependencies') {
            steps {
                bat 'npm install'
            }
        }

        stage('Test') {
            steps {
                bat 'npm test'
            }
        }

        stage('Docker Build') {
            steps {
                bat "docker build -t %IMAGE_NAME%:%IMAGE_TAG% ."
            }
        }

        stage('Docker Login & Push') {
            steps {

                withCredentials([
                    usernamePassword(
                        credentialsId: 'dockerhub-creds',
                        usernameVariable: 'DOCKER_USERNAME',
                        passwordVariable: 'DOCKER_PASSWORD'
                    )
                ]) {

                    bat 'docker login -u "%DOCKER_USERNAME%" -p "%DOCKER_PASSWORD%"'

                    bat "docker push %IMAGE_NAME%:%IMAGE_TAG%"
                }
            }
        }
    }

    post {
        success {
            echo "Docker image pushed successfully!"
            echo "Image: ${IMAGE_NAME}:${IMAGE_TAG}"
        }

        failure {
            echo "Pipeline failed."
        }
    }
}