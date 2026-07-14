import storageService from "./storageService";

const STORAGE_KEY = "toyotasure_customers";

const customerService = {
  getAll() {
    return storageService.get(STORAGE_KEY) || [];
  },

  saveAll(customers) {
    storageService.set(STORAGE_KEY, customers);
  },

  add(customer) {
    const customers = this.getAll();
    customers.unshift(customer);
    this.saveAll(customers);
  },

  update(updatedCustomer) {
    const customers = this.getAll().map((customer) =>
      customer.id === updatedCustomer.id ? updatedCustomer : customer
    );

    this.saveAll(customers);
  },

  delete(id) {
    const customers = this.getAll().filter(
      (customer) => customer.id !== id
    );

    this.saveAll(customers);
  },
};

export default customerService;