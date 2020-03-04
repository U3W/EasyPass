package dev.easypass.auth.security;

public class RustCall {
  public static String encrypt(String msg, String key) {
    return msg+"_ENC_"+key;
  }
}
