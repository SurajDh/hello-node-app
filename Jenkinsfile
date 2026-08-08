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
                        url: "${GITOPS_REPO}"

                    bat '''
                        git checkout main
                        git pull origin main
                    '''

                    bat '''
                        powershell -NoProfile -Command ^
                        "$file = 'deployment.yaml'; ^
                        $content = Get-Content $file -Raw; ^
                        $content = $content -replace 'image:\\s*surajsdm/hello-node:\\S+', 'image: surajsdm/hello-node:%IMAGE_TAG%'; ^
                        Set-Content $file $content -NoNewline"
                    '''

                    echo "Checking updated deployment.yaml..."

                    bat 'type deployment.yaml'

                    echo "Checking Git diff..."

                    bat 'git diff -- deployment.yaml'

                    bat '''
                        git config user.name "Jenkins"
                        git config user.email "jenkins@localhost"

                        git add deployment.yaml

                        git diff --cached --quiet
                        if %ERRORLEVEL% EQU 0 (
                            echo No changes detected.
                            exit /b 1
                        )

                        git commit -m "Update hello-node image to %IMAGE_TAG%"
                    '''

                    withCredentials([
                        usernamePassword(
                            credentialsId: 'github-creds',
                            usernameVariable: 'GITHUB_USER',
                            passwordVariable: 'GITHUB_TOKEN'
                        )
                    ]) {

                        bat '''
                            git push origin main
                        '''
                    }
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