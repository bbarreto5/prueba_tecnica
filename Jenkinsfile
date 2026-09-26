pipeline {
    agent any

    stages {

	stage('Verify Source') {
	    steps {
	        sh '''
	            echo "Commit:"
	            git rev-parse --short HEAD

	            echo "Branch:"
	            echo "$GIT_BRANCH"
	        '''
	    }
	}


        stage('Build Backend Image') {
            steps {
                sh '''
                    docker build -t prueba-tecnica-backend ./backend
                '''
            }
        }

        stage('Backend Tests') {
            steps {
                sh '''
                    docker network create jenkins-ci || true

                    docker run -d \
                        --name jenkins-postgres \
                        --network jenkins-ci \
                        -e POSTGRES_USER=postgres \
                        -e POSTGRES_PASSWORD=postgres \
                        -e POSTGRES_DB=incidents_test \
                        postgres:16

                    until docker exec jenkins-postgres pg_isready -U postgres -d incidents_test; do
                        sleep 1
                    done

                    docker run --rm \
                        --network jenkins-ci \
                        -e DATABASE_URL="postgresql+psycopg://postgres:postgres@jenkins-postgres:5432/incidents_test" \
                        -e TEST_DATABASE_URL="postgresql+psycopg://postgres:postgres@jenkins-postgres:5432/incidents_test" \
                        -e JWT_SECRET_KEY="test-secret-key" \
                        -e JWT_ALGORITHM="HS256" \
                        -e JWT_ACCESS_TOKEN_EXPIRE_MINUTES="60" \
                        prueba-tecnica-backend \
                        pytest
                '''
            }
        }

	stage('Frontend Lint & Build') {
	    steps {
	        sh '''
	            docker run --rm \
	                -v "$WORKSPACE/frontend:/app" \
	                -w /app \
	                node:22-alpine \
	                sh -c "npm ci && npm run lint && npm run build"
	        '''
	    }
	}

	stage('Deploy') {
	    steps {
	        withCredentials([
	            string(
	                credentialsId: 'jwt-secret-key',
	                variable: 'JWT_SECRET_KEY'
	            )
	        ]) {
	            sh '''
	                docker compose \
	                    -f docker-compose.jenkins.yml \
	                    down

	                docker compose \
	                    -f docker-compose.jenkins.yml \
	                    up -d --build
	            '''
	        }
	    }
	}
    }

    post {
        always {
            sh '''
                docker rm -f jenkins-postgres 2>/dev/null || true
            '''
        }
    }
}
