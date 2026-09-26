pipeline {
    agent any

    stages {
        stage('Environment') {
            steps {
                sh 'python3 --version'
                sh 'node --version'
                sh 'docker --version'
            }
        }
    }
}