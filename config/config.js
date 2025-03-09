// A2: Cryptographic Failures - Hardcoded secrets in source code

module.exports = {
  secretKey: "super_secret_key_do_not_share",
  apiKeys: {
    stripe: "sk_live_51ABCDEFghijklmnopqrstuvwxyz",
    aws: "AKIAIOSFODNN7EXAMPLE/wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"
  },
  emailServer: {
    host: "smtp.company.com",
    user: "admin",
    password: "Password123"
  },
  adminPassword: "CTF{master_password_123}",
  flags: {
    flag1: "CTF{sql_injection_master}",
    flag2: "CTF{xss_is_still_relevant}",
    flag3: "CTF{broken_access_control}"
  }
};
