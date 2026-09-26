pipeline {
    agent any

    stages {
        stage('Python 3.12') {
            steps {
                sh 'docker run --rm python:3.12-slim python --version'
            }
        }
    }
}