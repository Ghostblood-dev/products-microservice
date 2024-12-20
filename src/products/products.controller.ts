import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseArrayPipe, ParseIntPipe } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PaginationDto } from 'src/common/dto/paginations.dto';
import { MessagePattern, Payload } from '@nestjs/microservices';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) { }

  // @Post()
  @MessagePattern({ cmd: 'createProduct' })
  create(@Payload() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  // @Get()
  @MessagePattern({ cmd: 'findAllProducts' })
  findAll(@Payload() paginationDto: PaginationDto) {
    return this.productsService.findAll(paginationDto);
  }

  // @Get(':id')
  @MessagePattern({ cmd: 'findOneProducts' })
  findOne(@Payload('id') id: number) {
    return this.productsService.findOne(+id);
  }

  // @Patch(':id')
  @MessagePattern({ cmd: 'updateProducts' })
  update(
    @Payload() updateProductDto: UpdateProductDto
  ) {
    return this.productsService.update(updateProductDto.id, updateProductDto);
  }

  // @Delete(':id')
  @MessagePattern({ cmd: 'deleteProduct' })
  remove(@Payload('id', ParseIntPipe) id: number) {
    return this.productsService.remove(id);
  }

  @MessagePattern({ cmd: 'validate_products' })
  validateProduct(@Payload() ids: number[]) {
    return this.productsService.validateProducts(ids);
  }
}
