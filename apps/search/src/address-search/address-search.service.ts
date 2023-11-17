import { GhnService } from '@app/third-party';
import { GhnWardDTO, GhnProvinceDTO, GhnDistrictDTO } from '@app/third-party/giaohangnhanh/dtos';
import {
    Inject,
    Injectable,
    HttpException,
    NotFoundException,
    BadRequestException,
    InternalServerErrorException,
} from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { Store } from 'cache-manager';
import { convertTimeString } from 'convert-time-string';
import { REDIS_CACHE } from '~libs/common/constants/cache.constant';
import { AxiosError } from 'axios';

@Injectable()
export class AddressSearchService {
    constructor(
        private readonly ghnService: GhnService,
        @Inject(REDIS_CACHE) private readonly cacheManager: Store,
    ) {}

    private readonly GET_PROVINCES_CACHE_KEY = 'address_search_get_provinces';
    private readonly GET_DISTRICTS_CACHE_KEY = 'address_search_get_districts';
    private readonly GET_WARDS_CACHE_KEY = 'address_search_get_wards';

    async getProvinces(): Promise<GhnProvinceDTO[]> {
        try {
            const listProvinceCache: GhnProvinceDTO[] = await this.cacheManager.get(
                this.GET_PROVINCES_CACHE_KEY,
            );
            if (listProvinceCache) {
                return listProvinceCache;
            }

            const listProvince = await this.ghnService.getProvinces();
            if (!listProvince) {
                throw new NotFoundException('Cannot found provinces');
            }

            await this.setCache(this.GET_PROVINCES_CACHE_KEY, listProvince);
            return listProvince;
        } catch (error) {
            if (error instanceof AxiosError) {
                throw new RpcException(new BadRequestException(error.response.data.message));
            }
            if (error instanceof HttpException) {
                throw new RpcException(error);
            }
            throw new RpcException(new InternalServerErrorException(error.message));
        }
    }

    async getDistricts(provinceId: number): Promise<GhnDistrictDTO[]> {
        try {
            if (!provinceId) {
                throw new BadRequestException('Province id is required');
            }

            const districtCacheKey = `${this.GET_DISTRICTS_CACHE_KEY}_${provinceId}`;
            const listDistrictCache: GhnDistrictDTO[] = await this.cacheManager.get(
                districtCacheKey,
            );
            if (listDistrictCache) {
                return listDistrictCache;
            }

            const listDistrict = await this.ghnService.getDistricts(provinceId);
            if (!listDistrict) {
                throw new NotFoundException('Cannot found districts');
            }

            await this.setCache(districtCacheKey, listDistrict);
            return listDistrict;
        } catch (error) {
            if (error instanceof AxiosError) {
                throw new RpcException(new BadRequestException(error.response.data.message));
            }
            if (error instanceof HttpException) {
                throw new RpcException(error);
            }
            throw new RpcException(new InternalServerErrorException(error.message));
        }
    }

    async getWards(districtId: number): Promise<GhnWardDTO[]> {
        try {
            if (!districtId) {
                throw new BadRequestException('District id is required');
            }

            const wardCacheKey = `${this.GET_WARDS_CACHE_KEY}_${districtId}`;
            const listWardCache: GhnWardDTO[] = await this.cacheManager.get(wardCacheKey);
            if (listWardCache) {
                return listWardCache;
            }
            const listWard = await this.ghnService.getWards(districtId);

            if (!listWard) {
                throw new NotFoundException('Cannot found wards');
            }

            await this.setCache(wardCacheKey, listWard);
            return listWard;
        } catch (error) {
            if (error instanceof AxiosError) {
                throw new RpcException(new BadRequestException(error.response.data.message));
            }
            if (error instanceof HttpException) {
                throw new RpcException(error);
            }
            throw new RpcException(new InternalServerErrorException(error.message));
        }
    }

    private async setCache(key: string, value: any, ttl?: number) {
        return this.cacheManager.set(key, value, ttl ?? convertTimeString('1h'));
    }
}
