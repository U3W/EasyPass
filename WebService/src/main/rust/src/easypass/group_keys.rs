
/// GroupKeys stores the encryption keys of groups in EasyPass.
/// Every user has a general master key for encrypting data.
/// But only admins have an admin master key for adding new users.
#[derive(Debug)]
pub struct GroupKeys {
    gmk: String,
    amk: Option<String>,
}

impl GroupKeys {
    pub fn new(gmk: String, amk: Option<String>) -> GroupKeys {
        GroupKeys {
            gmk, amk
        }
    }

    pub fn gmk(&self) -> String {
        self.gmk.clone()
    }

    pub fn amk(&self) -> Option<String> {
        self.amk.clone()
    }

    pub fn amk_unwrapped(&self) -> String {
        self.amk.as_ref().unwrap().clone()
    }

    pub fn is_admin(&self) -> bool {
        self.amk.is_some()
    }

}