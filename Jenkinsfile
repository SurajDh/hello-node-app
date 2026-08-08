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

                    bat '''
powershell -NoProfile -ExecutionPolicy Bypass -Command ^
"$file = 'deployment.yaml'; ^
$content = Get-Content $file -Raw; ^
$content = $content -replace 'image:\\s*surajsdm/hello-node:\\S+', 'image: surajsdm/hello-node:%IMAGE_TAG%'; ^
$content = $content -replace '(?s)env:\\s*.*?(?=\\s*ports:)', 'env:\\r\\n        - name: APP_VERSION\\r\\n          value: "%IMAGE_TAG%"\\r\\n        - name: BUILD_NUMBER\\r\\n          value: "%BUILD_NUMBER%"\\r\\n        - name: GIT_COMMIT\\r\\n          value: "%GIT_COMMIT%"\\r\\n'; ^
if ($content -notmatch 'name:\\s*APP_VERSION') { ^
$content = $content -replace '(containerPort:\\s*3000)', 'env:\\r\\n        - name: APP_VERSION\\r\\n          value: "%IMAGE_TAG%"\\r\\n        - name: BUILD_NUMBER\\r\\n          value: "%BUILD_NUMBER%"\\r\\n        - name: GIT_COMMIT\\r\\n          value: "%GIT_COMMIT%"\\r\\n\\r\\n        $1'; ^
}; ^
Set-Content $file $content -NoNewline"
'''

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