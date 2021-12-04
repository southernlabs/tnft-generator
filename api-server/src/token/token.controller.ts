import { Controller, Get, Param, ParseIntPipe, Res, Header } from '@nestjs/common';
import { TokenService } from './token.service';
import {ApiOperation, ApiResponse, ApiTags, ApiProperty,ApiQuery,ApiBody, ApiParam } from "@nestjs/swagger";

@ApiTags('Tokens')
@Controller("token")
export class TokenController {
  constructor(private readonly tokenService: TokenService) {}

  @ApiOperation({summary: 'Get image of NFT by ID', description: "The file is stored on server with this application. Make sure the folder with images exists."})
  @ApiParam({name: "id"})
  @Get(":id.png")
  @Header('content-type', 'image/png')
  async getImagePng(@Param('id', ParseIntPipe) id: number, @Res() response) {
    return (await this.tokenService.getImage(id)).pipe(response);
  }

  @ApiOperation({summary: 'Get metadata of NFT by ID'})
  @ApiParam({name: "id"})
  @ApiResponse({})
  @ApiResponse({status: 200, schema:{example:{
    "image": "https://gateway.pinata.cloud/ipfs/QmQFVa7YJ1NEgXdzazqHaBAQBZYi7anUpEixfZNcjnbkhK",
    "tokenId": 1,
    "name": "EverDucks 1",
    "attributes": [
      {
        "trait_type": "Background",
        "value": "White"
      },
      {
        "trait_type": "Body",
        "value": "Duck"
      },
      {
        "trait_type": "Face",
        "value": "face2"
      },
      {
        "trait_type": "Accessory",
        "value": "accessory2"
      },
      {
        "trait_type": "Hair",
        "value": "hair4"
      }
    ],
    "metadata": "http://localhost:8080/token/1"
  }}})
  @Get(":id")
  getData(@Param('id', ParseIntPipe) id): string {
    return this.tokenService.getData(id);
  }

}
