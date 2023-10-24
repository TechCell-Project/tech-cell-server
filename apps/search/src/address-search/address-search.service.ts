import { GhnService } from '@app/third-party';
import { GhnWardDTO, GhnProvinceDTO, GhnDistrictDTO } from '@app/third-party/giaohangnhanh/dtos';
import {
    Inject,
    Injectable,
    InternalServerErrorException,
    BadRequestException,
} from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { Store } from 'cache-manager';
import { convertTimeString } from 'convert-time-string';
import { REDIS_CACHE } from '@app/common/constants/cache.constant';

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
        const listProvinceCache = await this.cacheManager.get(this.GET_PROVINCES_CACHE_KEY);
        if (listProvinceCache) {
            return listProvinceCache as GhnProvinceDTO[];
        }

        const listProvince = await this.ghnService.getProvinces();
        if (!listProvince) {
            throw new RpcException(new InternalServerErrorException('Cannot get provinces'));
        }

        await this.setCache(this.GET_PROVINCES_CACHE_KEY, listProvince);
        return listProvince;
    }

    async getDistricts(provinceId: number): Promise<GhnDistrictDTO[]> {
        if (!provinceId) throw new RpcException(new BadRequestException('Province id is required'));

        const districtCacheKey = `${this.GET_DISTRICTS_CACHE_KEY}_${provinceId}`;
        const listDistrictCache = await this.cacheManager.get(districtCacheKey);
        if (listDistrictCache) {
            return listDistrictCache as GhnDistrictDTO[];
        }

        const listDistrict = await this.ghnService.getDistricts(provinceId);
        if (!listDistrict) {
            throw new RpcException(new InternalServerErrorException('Cannot get districts'));
        }

        await this.setCache(districtCacheKey, listDistrict);
        return listDistrict;
    }

    async getWards(districtId: number): Promise<GhnWardDTO[]> {
        if (!districtId) throw new RpcException(new BadRequestException('District id is required'));

        const wardCacheKey = `${this.GET_WARDS_CACHE_KEY}_${districtId}`;
        const listWardCache = await this.cacheManager.get(wardCacheKey);
        if (listWardCache) {
            return listWardCache as GhnWardDTO[];
        }

        const listWard = await this.ghnService.getWards(districtId);
        if (!listWard) {
            throw new RpcException(new InternalServerErrorException('Cannot get wards'));
        }

        await this.setCache(wardCacheKey, listWard);
        return listWard;
    }

    private async setCache(key: string, value: any) {
        return this.cacheManager.set(key, value, convertTimeString('1h'));
    }
}
