pipeline {

    agent any

    environment {
        IMAGE_NAME = "surajsdm/hello-node"
        IMAGE_TAG = "${BUILD_NUMBER}"

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
                        usernameVariable: 'DOCKER_USER',
                        passwordVariable: 'DOCKER_PASSWORD'
                    )
                ]) {

                    bat 'docker login -u %DOCKER_USER% -p %DOCKER_PASSWORD%'

                    bat 'docker push %IMAGE_NAME%:%IMAGE_TAG%'
                }
            }
        }

       stage('Update GitOps Repository') {

    steps {

        dir('gitops') {

            git branch: 'main',
                credentialsId: 'github-creds',
                url: 'https://github.com/surajDh/hello-node-gitops.git'

            bat 'git checkout main'
            bat 'git pull origin main'

            writeFile file: 'update-image.ps1', text: '''
param(
    [string]$Tag
)

$file = "deployment.yaml"

$content = Get-Content -Path $file -Raw

$content = $content -replace `
    'image:\s*surajsdm/hello-node:\S+', `
    "image: surajsdm/hello-node:$Tag"

Set-Content -Path $file -Value $content -NoNewline

Write-Host "Updated image to: surajsdm/hello-node:$Tag"
'''

            bat 'powershell -NoProfile -ExecutionPolicy Bypass -File update-image.ps1 -Tag "%IMAGE_TAG%"'

            echo '===== DEPLOYMENT.YAML ====='

            bat 'type deployment.yaml'

            echo '===== GIT DIFF ====='

            bat 'git diff -- deployment.yaml'

            bat 'git config user.name "Jenkins"'
            bat 'git config user.email "jenkins@localhost"'

            bat 'git add deployment.yaml'

            echo '===== STAGED DIFF ====='

            bat 'git diff --cached -- deployment.yaml'

            bat 'git commit -m "Update hello-node image to %IMAGE_TAG%"'

            bat 'git push origin main'
        }
    }
}
    }

    post {

        success {
            echo "Pipeline completed successfully."
            echo "Docker image: %IMAGE_NAME%:%IMAGE_TAG%"
        }

        failure {
            echo "Pipeline failed."
        }
    }
}