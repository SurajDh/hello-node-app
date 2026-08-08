pipeline {

    agent any

    environment {
        IMAGE_NAME = "surajsdm/hello-node"
        IMAGE_TAG  = "${BUILD_NUMBER}"
        GITOPS_REPO = "https://github.com/surajDh/hello-node-gitops.git"
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

        stage('Update GitOps Repository') {
            steps {

                dir('gitops') {

                    git(
                        url: "${GITOPS_REPO}",
                        branch: 'main',
                        credentialsId: 'github-creds'
                    )

                    bat """
                        powershell -Command "(Get-Content deployment.yaml) -replace 'image: surajsdm/hello-node:[0-9]+', 'image: surajsdm/hello-node:%IMAGE_TAG%' | Set-Content deployment.yaml"
                    """

                    bat 'git config user.name "Jenkins"'
                    bat 'git config user.email "jenkins@localhost"'

                    bat 'git add deployment.yaml'
                    bat 'git commit -m "Update hello-node image to %IMAGE_TAG%"'
                    bat 'git push origin main'
                }
            }
        }
    }

    post {

        success {
            echo "CI/CD preparation completed successfully."
            echo "Docker image: ${IMAGE_NAME}:${IMAGE_TAG}"
        }

        failure {
            echo "Pipeline failed."
        }
    }
}
