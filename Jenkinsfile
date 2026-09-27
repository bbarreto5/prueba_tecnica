pipeline {
    agent any

    parameters {
        string(
            name: 'DEPLOY_VERSION',
            defaultValue: '',
            description: 'Docker image tag to deploy. Leave empty to deploy the current Git commit.'
        )
    }

    stages {
        stage('Verify Source') {
            when {
                expression {
                    return !params.DEPLOY_VERSION
                }
            }
            steps {
                sh '''
                    echo "Commit:"
                    git rev-parse --short HEAD

                    echo "Branch:"
                    echo "$GIT_BRANCH"
                '''
            }
        }

        stage('Build & Tag Backend Image') {
            when {
                expression {
                    return !params.DEPLOY_VERSION
                }
            }
            steps {
                sh '''
                    IMAGE="ghcr.io/bbarreto5/prueba_tecnica-backend:${GIT_COMMIT}"

                    docker build -t "$IMAGE" ./backend

                    echo "Image created:"
                    docker images "$IMAGE"
                '''
            }
        }

        stage('Backend Tests') {
            when {
                expression {
                    return !params.DEPLOY_VERSION
                }
            }
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

                    IMAGE="ghcr.io/bbarreto5/prueba_tecnica-backend:${GIT_COMMIT}"

                    docker run --rm \
                        --network jenkins-ci \
                        -e DATABASE_URL="postgresql+psycopg://postgres:postgres@jenkins-postgres:5432/incidents_test" \
                        -e TEST_DATABASE_URL="postgresql+psycopg://postgres:postgres@jenkins-postgres:5432/incidents_test" \
                        -e JWT_SECRET_KEY="test-secret-key" \
                        -e JWT_ALGORITHM="HS256" \
                        -e JWT_ACCESS_TOKEN_EXPIRE_MINUTES="60" \
                        "$IMAGE" \
                        pytest
                '''
            }
        }

        stage('Build & Tag Frontend Image') {
            when {
                expression {
                    return !params.DEPLOY_VERSION
                }
            }
            steps {
                sh '''
                    IMAGE="ghcr.io/bbarreto5/prueba_tecnica-frontend:${GIT_COMMIT}"

                    docker build \
                        --build-arg NEXT_PUBLIC_API_URL="http://thinkpad.local:8000" \
                        -t "$IMAGE" \
                        ./frontend

                    echo "Image created:"
                    docker images "$IMAGE"
                '''
            }
        }

        stage('Frontend Lint') {
            when {
                expression {
                    return !params.DEPLOY_VERSION
                }
            }
            steps {
                sh '''
                    docker run --rm \
                        -v "$WORKSPACE/frontend:/app" \
                        -w /app \
                        node:22-alpine \
                        sh -c "npm ci && npm run lint"
                '''
            }
        }

        stage('GHCR Login') {
            steps {
                withCredentials([
                    usernamePassword(
                        credentialsId: 'github-ghcr',
                        usernameVariable: 'GHCR_USER',
                        passwordVariable: 'GHCR_TOKEN'
                    )
                ]) {
                    sh '''
                        echo "$GHCR_TOKEN" | docker login ghcr.io \
                            -u "$GHCR_USER" \
                            --password-stdin
                    '''
                }
            }
        }

        stage('Push Backend Image') {
            when {
                expression {
                    return !params.DEPLOY_VERSION
                }
            }
            steps {
               sh '''
                    BACKEND_IMAGE="ghcr.io/bbarreto5/prueba_tecnica-backend:${GIT_COMMIT}"
                    docker push "$BACKEND_IMAGE"
                '''
            }
        }

        stage('Push Frontend Image') {
            when {
                expression {
                    return !params.DEPLOY_VERSION
                }
            }
            steps {
                sh '''
                    FRONTEND_IMAGE="ghcr.io/bbarreto5/prueba_tecnica-frontend:${GIT_COMMIT}"
                    docker push "$FRONTEND_IMAGE"
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
                        DEPLOY_VERSION="${DEPLOY_VERSION:-$GIT_COMMIT}"

                        BACKEND_IMAGE="ghcr.io/bbarreto5/prueba_tecnica-backend:${DEPLOY_VERSION}"
                        export BACKEND_IMAGE

                        FRONTEND_IMAGE="ghcr.io/bbarreto5/prueba_tecnica-frontend:${DEPLOY_VERSION}"
                        export FRONTEND_IMAGE

                        echo "Deploying version: $DEPLOY_VERSION"

                        # TODO: In a production environment, consider removing
                        # 'docker compose down' to reduce deployment downtime.
                        # 'docker compose pull' + 'up -d' can allow Docker Compose
                        # to recreate only the services whose image changed.
                        docker compose \
                            -f docker-compose.jenkins.yml \
                            down

                        docker compose \
                            -f docker-compose.jenkins.yml \
                            pull

                        docker compose \
                            -f docker-compose.jenkins.yml \
                            up -d
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
