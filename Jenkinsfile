pipeline {
    agent any

    stages {
        stage('Checkout Code') {
            steps {
                git branch: 'main', url: 'https://github.com/meghlesh/reactnodecws.git'
            }
        }

        stage('Install Dependencies - Backend') {
            steps {
                dir('propcwsback') {
                    sh 'npm install'
                }
            }
        }

        stage('Build Backend') {
            steps {
                dir('propcwsback') {
                    sh 'npm run build || true'
                }
            }
        }

        stage('Install Dependencies - Frontend') {
            steps {
                sh 'npm install'
            }
        }

        stage('Build Frontend') {
            steps {
                sh 'npm run build'
            }
        }
    }
}
