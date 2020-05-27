import { inject, injectable } from 'tsyringe';

import AppError from '@shared/errors/AppError';

import IProductsRepository from '@modules/products/repositories/IProductsRepository';
import ICustomersRepository from '@modules/customers/repositories/ICustomersRepository';
import Product from '@modules/products/infra/typeorm/entities/Product';
import Order from '../infra/typeorm/entities/Order';
import IOrdersRepository from '../repositories/IOrdersRepository';

interface IProduct {
  id: string;
  quantity: number;
}

interface IRequest {
  customer_id: string;
  products: IProduct[];
}

@injectable()
class CreateOrderService {
  constructor(
    @inject('OrdersRepository')
    private ordersRepository: IOrdersRepository,

    @inject('ProductsRepository')
    private productsRepository: IProductsRepository,

    @inject('CustomersRepository')
    private customersRepository: ICustomersRepository,
  ) {}

  public async execute({ customer_id, products }: IRequest): Promise<Order> {
    const customer = this.customersRepository.findById(customer_id);
    if (!customer) {
      throw new AppError('Customer ID does not exists.');
    }

    const idProducts = products.map(product => product.id);

    const listProducts = await this.productsRepository.findAllById(idProducts);
    if (idProducts.length !== listProducts.length) {
      throw new AppError('Products ID not exists.');
    }

    const productsOrder = products.map(product => ({
      product_id: product.id,
      price: Number(listProducts.find(prod => prod.id === product.id).price),
      quantity: product.quantity,
    }));

    const order = this.ordersRepository.create({
      customer,
      products: productsOrder,
    });

    return order;
  }
}

export default CreateOrderService;
