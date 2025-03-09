// A2: Cryptographic Failures - Hardcoded secrets in source code

module.exports = {
  secretKey: "super_secret_key_do_not_share",
  apiKeys: {
    stripe: "sk_live_CTF{leaked_payment_api_keys}",
    aws: "AKIAIOSFODNN7EXAMPLE/wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"
  },
  emailServer: {
    host: "smtp.company.com",
    user: "admin",
    password: "CTF{insecure_credentials_storage}"
  },
  adminPassword: "CTF{master_password_123}",
  flags: {
    flag1: "CTF{sql_injection_master}",
    flag2: "CTF{xss_is_still_relevant}",
    flag3: "CTF{broken_access_control}",
    internal_flag: "CTF{security_misconfiguration_in_config}"
  }
};
