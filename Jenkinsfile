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
                bat 'docker build -t %IMAGE_NAME%:%IMAGE_TAG% .'
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
                        url: "${GITOPS_REPO}"

                    bat 'git checkout main'
                    bat 'git pull origin main'

                    writeFile file: 'update-image.ps1', text: '''
param(
    [string]$Tag
)

$file = "deployment.yaml"

$content = Get-Content -Path $file -Raw

$oldImage = "surajsdm/hello-node:"
$start = $content.IndexOf($oldImage)

if ($start -lt 0) {
    Write-Error "Docker image was not found in deployment.yaml"
    exit 1
}

$end = $content.IndexOf("`n", $start)

if ($end -lt 0) {
    $end = $content.Length
}

$currentLine = $content.Substring($start, $end - $start)

$newLine = "surajsdm/hello-node:$Tag"

$content = $content.Replace($currentLine, $newLine)

Set-Content -Path $file -Value $content -NoNewline

Write-Host "Updated image to surajsdm/hello-node:$Tag"
'''

                    bat 'powershell -NoProfile -ExecutionPolicy Bypass -File update-image.ps1 -Tag "%IMAGE_TAG%"'

                    bat 'type deployment.yaml'

                    bat 'git diff -- deployment.yaml'

                    bat 'git config user.name "Jenkins"'
                    bat 'git config user.email "jenkins@localhost"'

                    bat 'git add deployment.yaml'

                    bat 'git diff --cached -- deployment.yaml'

                    bat 'git commit -m "Update hello-node image to %IMAGE_TAG%"'

                    bat 'git push origin main'
                }
            }
        }
    }

    post {

        success {
            echo "Pipeline successful. Docker image: ${IMAGE_NAME}:${IMAGE_TAG}"
        }

        failure {
            echo "Pipeline failed."
        }
    }
}