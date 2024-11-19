module.exports = {
    apps: [
        {
            name: "nodeserver",
            script: "/home/ec2-user/milletianapiserver/bin/www",
            interpreter: "sudo",
            env: {
                NODE_ENV: "production",
                DEBUG: "nodeserver:*",
            },
            watch: true,
        },
    ],
};