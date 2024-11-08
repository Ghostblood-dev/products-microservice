import { HttpStatus, Injectable, Logger, NotFoundException, OnModuleInit } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaClient } from '@prisma/client';
import { PaginationDto } from 'src/common/dto/paginations.dto';
import { IsNumber } from 'class-validator';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class ProductsService extends PrismaClient implements OnModuleInit {

  private readonly logger = new Logger('ProductServices')

  onModuleInit() {
    this.$connect()
    this.logger.log(`Database connected`);
  }
  create(createProductDto: CreateProductDto) {
    return this.product.create({ data: createProductDto })
  }

  async findAll(paginationDto: PaginationDto) {
    const { page, limit } = paginationDto
    const totalCount = await this.product.count({ where: { isDelete: false } })
    const lastPage = Math.ceil(totalCount / limit)
    const data = await this.product.findMany({ skip: (page - 1) * limit, take: limit, where: { isDelete: false } })
    return {
      data, totalCount,
      meta: {
        tota: totalCount,
        page, lastPage
      }
    }
  }

  @IsNumber()
  async findOne(id: number) {
    const product = await this.product.findFirst({ where: { id, isDelete: false } })
    if (!product) {
      throw new RpcException({
        message: `Product with the id #${id} not found`,
        status: HttpStatus.NOT_FOUND
      })
    }
    return product
  }

  async update(id: number, updateProductDto: UpdateProductDto) {
    const { id: _, ...data } = updateProductDto
    await this.findOne(id)
    return await this.product.update({ data, where: { id } })
  }

  async remove(id: number) {
    await this.findOne(id)
    await this.product.update({ where: { id }, data: { isDelete: true } })
    return { message: `The product deleted success` }
  }

  async validateProducts(ids: number[]) {
    ids = Array.from(new Set(ids))
    const products = await this.product.findMany({
      where: {
        id: {
          in: ids
        }
      }
    })

    if (products.length !== ids.length) {
      throw new RpcException({ message: 'Some products were not found', status: HttpStatus.BAD_REQUEST })
    }

    return products
  }
}
