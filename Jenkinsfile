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

script {
    env.GIT_COMMIT_SHORT = bat(
        returnStdout: true,
        script: '@git rev-parse --short=7 HEAD'
    ).trim()
}
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

                    writeFile file: 'update-deployment.ps1', text: '''
$file = "deployment.yaml"

$lines = Get-Content $file

$currentVariable = ""

for ($i = 0; $i -lt $lines.Count; $i++) {

    $trimmed = $lines[$i].Trim()

    if ($trimmed -eq "- name: APP_VERSION") {
        $currentVariable = "APP_VERSION"
        continue
    }

    if ($trimmed -eq "- name: BUILD_NUMBER") {
        $currentVariable = "BUILD_NUMBER"
        continue
    }

    if ($trimmed -eq "- name: GIT_COMMIT") {
        $currentVariable = "GIT_COMMIT"
        continue
    }

    if ($trimmed.StartsWith("image: surajsdm/hello-node:")) {
        $indent = $lines[$i].Substring(0, $lines[$i].Length - $lines[$i].TrimStart().Length)
        $lines[$i] = $indent + "image: surajsdm/hello-node:" + $env:IMAGE_TAG
        continue
    }

    if ($trimmed.StartsWith("value:") -and $currentVariable -ne "") {

        $indent = $lines[$i].Substring(0, $lines[$i].Length - $lines[$i].TrimStart().Length)

        if ($currentVariable -eq "APP_VERSION") {
            $lines[$i] = $indent + 'value: "' + $env:IMAGE_TAG + '"'
        }

        if ($currentVariable -eq "BUILD_NUMBER") {
            $lines[$i] = $indent + 'value: "' + $env:IMAGE_TAG + '"'
        }

        if ($currentVariable -eq "GIT_COMMIT") {
            $lines[$i] = $indent + 'value: "' + $env:GIT_COMMIT_SHORT + '"'
        }

        $currentVariable = ""
    }
}

Set-Content -Path $file -Value $lines
'''

                    bat 'powershell -NoProfile -ExecutionPolicy Bypass -File update-deployment.ps1'

                    bat 'type deployment.yaml'

                    bat 'git config user.name "Jenkins"'
                    bat 'git config user.email "jenkins@localhost"'

                    bat 'git add deployment.yaml'

                    bat 'git diff --cached -- deployment.yaml'

                    bat 'git diff --cached --quiet || git commit -m "Update hello-node image to %IMAGE_TAG%"'

                    bat 'git push origin main'
                }
            }
        }
    }

    post {

        success {
            echo "Pipeline successful."
            echo "Docker image: ${IMAGE_NAME}:${IMAGE_TAG}"
            echo "Git commit: ${GIT_COMMIT_SHORT}"
        }

        failure {
            echo "Pipeline failed."
        }
    }
}