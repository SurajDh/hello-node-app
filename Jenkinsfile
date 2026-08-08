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
                powershell -Command "(Get-Content deployment.yaml) -replace '(^\\s*image:\\s*surajsdm/hello-node:)[^\\s]+', ('`$1' + '%IMAGE_TAG%') | Set-Content deployment.yaml"
            """

            echo "Updated deployment.yaml to image: ${IMAGE_NAME}:${IMAGE_TAG}"

            bat 'git diff -- deployment.yaml'

            bat 'git config user.name "Jenkins"'
            bat 'git config user.email "jenkins@localhost"'

            bat """
                git diff --quiet -- deployment.yaml
                if %ERRORLEVEL% EQU 0 (
                    echo No changes detected in deployment.yaml
                ) else (
                    git add deployment.yaml
                    git commit -m "Update hello-node image to %IMAGE_TAG%"
                    git push origin main
                )
            """
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
