import Map "mo:core/Map";
import Set "mo:core/Set";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Float "mo:core/Float";
import Int "mo:core/Int";
import Array "mo:core/Array";
import Order "mo:core/Order";
import Iter "mo:core/Iter";
import List "mo:core/List";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  // Types
  public type Medicine = {
    id : Text;
    name : Text;
    genericName : Text;
    category : Text;
    manufacturer : Text;
    batchNumber : Text;
    expiryDate : Int;
    quantity : Nat;
    unitPrice : Float;
    reorderLevel : Nat;
    isActive : Bool;
  };

  public type Category = {
    name : Text;
    description : Text;
  };

  public type Supplier = {
    id : Text;
    name : Text;
    contactPerson : Text;
    phone : Text;
    email : Text;
    address : Text;
    isActive : Bool;
  };

  public type SaleItem = {
    medicineId : Text;
    medicineName : Text;
    quantity : Nat;
    unitPrice : Float;
  };

  public type Sale = {
    id : Text;
    customerName : Text;
    items : [SaleItem];
    totalAmount : Float;
    timestamp : Int;
  };

  public type UserProfile = {
    name : Text;
    role : Text;
  };

  // Local modules for comparison
  module Medicine {
    public func compare(m1 : Medicine, m2 : Medicine) : Order.Order {
      Text.compare(m1.name, m2.name);
    };
  };

  // State
  var nextMedicineId = 1;
  var nextSupplierId = 1;
  var nextSaleId = 1;

  let medicines = Map.empty<Text, Medicine>();
  let categories = Map.empty<Text, Category>();
  let suppliers = Map.empty<Text, Supplier>();
  let sales = Map.empty<Text, Sale>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  // Authorization
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // User Profile Management
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // CRUD Operations
  // Medicines
  public shared ({ caller }) func addMedicine(
    name : Text,
    genericName : Text,
    category : Text,
    manufacturer : Text,
    batchNumber : Text,
    expiryDate : Int,
    quantity : Nat,
    unitPrice : Float,
    reorderLevel : Nat
  ) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };

    let id = nextMedicineId.toText();
    nextMedicineId += 1;

    let medicine : Medicine = {
      id;
      name;
      genericName;
      category;
      manufacturer;
      batchNumber;
      expiryDate;
      quantity;
      unitPrice;
      reorderLevel;
      isActive = true;
    };

    medicines.add(id, medicine);
    id;
  };

  public shared ({ caller }) func updateMedicine(
    id : Text,
    name : Text,
    genericName : Text,
    category : Text,
    manufacturer : Text,
    batchNumber : Text,
    expiryDate : Int,
    quantity : Nat,
    unitPrice : Float,
    reorderLevel : Nat,
    isActive : Bool
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };

    switch (medicines.get(id)) {
      case (null) { Runtime.trap("Medicine not found") };
      case (?_) {
        medicines.add(
          id,
          {
            id;
            name;
            genericName;
            category;
            manufacturer;
            batchNumber;
            expiryDate;
            quantity;
            unitPrice;
            reorderLevel;
            isActive;
          },
        );
      };
    };
  };

  public shared ({ caller }) func deleteMedicine(id : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };

    switch (medicines.get(id)) {
      case (null) { Runtime.trap("Medicine not found") };
      case (?_) {
        medicines.remove(id);
      };
    };
  };

  public query ({ caller }) func getMedicine(_id : Text) : async Medicine {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view inventory");
    };

    switch (medicines.get(_id)) {
      case (null) { Runtime.trap("Medicine not found") };
      case (?medicine) { medicine };
    };
  };

  public query ({ caller }) func getAllMedicines() : async [Medicine] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view inventory");
    };

    medicines.values().toArray().sort();
  };

  public query ({ caller }) func getLowStockMedicines() : async [Medicine] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view inventory");
    };

    medicines.values().filter(
      func(med) {
        med.quantity <= med.reorderLevel;
      }
    ).toArray();
  };

  public query ({ caller }) func getExpiringMedicines(daysFromNow : Nat) : async [Medicine] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view inventory");
    };

    let currentTime = Time.now();
    let daysInNanos = daysFromNow * 24 * 60 * 60 * 1_000_000_000;
    let expiryThreshold = currentTime + daysInNanos;

    medicines.values().filter(
      func(med) {
        med.expiryDate <= expiryThreshold;
      }
    ).toArray();
  };

  // Categories
  public shared ({ caller }) func addCategory(name : Text, description : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };

    if (categories.containsKey(name)) { Runtime.trap("Category already exists") };
    let category : Category = { name; description };
    categories.add(name, category);
  };

  public shared ({ caller }) func updateCategory(name : Text, description : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };

    switch (categories.get(name)) {
      case (null) { Runtime.trap("Category not found") };
      case (?_) {
        categories.add(name, { name; description });
      };
    };
  };

  public shared ({ caller }) func deleteCategory(name : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };

    switch (categories.get(name)) {
      case (null) { Runtime.trap("Category not found") };
      case (?_) {
        categories.remove(name);
      };
    };
  };

  public query ({ caller }) func getCategory(name : Text) : async Category {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view inventory");
    };

    switch (categories.get(name)) {
      case (null) { Runtime.trap("Category not found") };
      case (?category) { category };
    };
  };

  public query ({ caller }) func getAllCategories() : async [Category] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view inventory");
    };

    categories.values().toArray();
  };

  // Suppliers
  public shared ({ caller }) func addSupplier(
    name : Text,
    contactPerson : Text,
    phone : Text,
    email : Text,
    address : Text
  ) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };

    let id = nextSupplierId.toText();
    nextSupplierId += 1;

    let supplier : Supplier = {
      id;
      name;
      contactPerson;
      phone;
      email;
      address;
      isActive = true;
    };

    suppliers.add(id, supplier);
    id;
  };

  public shared ({ caller }) func updateSupplier(
    id : Text,
    name : Text,
    contactPerson : Text,
    phone : Text,
    email : Text,
    address : Text,
    isActive : Bool
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };

    switch (suppliers.get(id)) {
      case (null) { Runtime.trap("Supplier not found") };
      case (?_) {
        suppliers.add(
          id,
          {
            id;
            name;
            contactPerson;
            phone;
            email;
            address;
            isActive;
          },
        );
      };
    };
  };

  public shared ({ caller }) func deleteSupplier(id : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };

    switch (suppliers.get(id)) {
      case (null) { Runtime.trap("Supplier not found") };
      case (?_) {
        suppliers.remove(id);
      };
    };
  };

  public query ({ caller }) func getSupplier(_id : Text) : async Supplier {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view inventory");
    };

    switch (suppliers.get(_id)) {
      case (null) { Runtime.trap("Supplier not found") };
      case (?supplier) { supplier };
    };
  };

  public query ({ caller }) func getAllSuppliers() : async [Supplier] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view inventory");
    };

    suppliers.values().toArray();
  };

  // Sales
  public shared ({ caller }) func createSale(customerName : Text, items : [SaleItem], totalAmount : Float) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create sales");
    };

    let id = nextSaleId.toText();
    nextSaleId += 1;

    let sale : Sale = {
      id;
      customerName;
      items;
      totalAmount;
      timestamp = Time.now();
    };

    sales.add(id, sale);
    id;
  };

  public query ({ caller }) func getSale(_id : Text) : async Sale {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view sales");
    };

    switch (sales.get(_id)) {
      case (null) { Runtime.trap("Sale not found") };
      case (?sale) { sale };
    };
  };

  public query ({ caller }) func getAllSales() : async [Sale] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view sales");
    };

    sales.values().toArray();
  };

  public query ({ caller }) func getSalesByDateRange(startDate : Int, endDate : Int) : async [Sale] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view sales");
    };

    sales.values().filter(
      func(sale) {
        sale.timestamp >= startDate and sale.timestamp <= endDate;
      }
    ).toArray();
  };

  // Search & Queries
  public query ({ caller }) func searchMedicines(searchTerm : Text) : async [Medicine] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can search inventory");
    };

    medicines.values().filter(
      func(med) {
        med.name.contains(#text searchTerm) or
        med.genericName.contains(#text searchTerm);
      }
    ).toArray();
  };

  // Dashboard Stats
  public query ({ caller }) func getDashboardStats() : async {
    totalMedicines : Nat;
    totalCategories : Nat;
    lowStockCount : Nat;
    expiringSoonCount : Nat;
  } {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view dashboard");
    };

    let currentTime = Time.now();
    let ninetyDaysInNanos = 90 * 24 * 60 * 60 * 1_000_000_000;
    let expiryThreshold = currentTime + ninetyDaysInNanos;

    var lowStockCount = 0;
    var expiringSoonCount = 0;

    for (med in medicines.values()) {
      if (med.quantity <= med.reorderLevel) {
        lowStockCount += 1;
      };
      if (med.expiryDate <= expiryThreshold) {
        expiringSoonCount += 1;
      };
    };

    {
      totalMedicines = medicines.size();
      totalCategories = categories.size();
      lowStockCount;
      expiringSoonCount;
    };
  };
};
