pipeline {
    agent any

    stages {
        stage('Backend Tests') {
            steps {
                sh '''
                    docker run --rm \
                      -v "$WORKSPACE/backend:/app" \
                      -w /app \
                      python:3.12-slim \
                      sh -c "pip install -r requirements.txt && pytest"
                '''
            }
        }
    }
}
