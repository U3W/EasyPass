pipeline{
node {
    checkout scm
    docker.withRegistry('https://registry.nonamehd.win') {

    	def customImage = docker.build("easypass:${env.BUILD_ID}")
    	customImage.push()

    	customImage.push('latest')
    }
}
}
