pipeline {
    agent any


    environment {
        NODEJS_HOME = tool name: 'nodejs18.16.1' // Use the name configured in Jenkins
        PATH = "${NODEJS_HOME}/bin:${env.PATH}"
        SONARQUBE_SERVER = 'sonarQubeJenkins' // Use the SonarQube local server
        JENKINS_URL='https://jenkins.codup.io/'    
        NEXUS_URL = 'nexus.codup.io:8081'
        NEXUS_REPOSITORY = 'HopsonGrace'
        NEXUS_CREDENTIALS_ID = 'nexus-credentials'
        PACKAGE_NAME = 'HopsonGrace-Backend' 
        GROUP_ID = 'co.codup.GraceHopson'  
        PROJECT_NAME = 'HopsonGrace-Backend'
        VERSION = "v${env.BUILD_NUMBER}"     
  }

      stages {

        

       

     stage('SonarQube Analysis') {
           environment {
                SCANNER_HOME = tool 'SonarQube Scanner'
           }
            steps {
                echo 'Performing SonarQube analysis'
                withSonarQubeEnv('sonarQubeJenkins') {
                    sh "${SCANNER_HOME}/bin/sonar-scanner -X"
                }
            }
        }



    //   
    //  stage("Quality Gate") {
    //         steps {
    //             script {
    //                 timeout(time: 1, unit: 'HOURS') {
    //                     waitForQualityGate abortPipeline: true
  
    //                 }
    //             }
    //          }
    //     }






  }

 
   
}
