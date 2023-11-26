import { GhnService } from '~libs/third-party';
import { GhnWardDTO, GhnProvinceDTO, GhnDistrictDTO } from '~libs/third-party/giaohangnhanh/dtos';
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { convertTimeString } from 'convert-time-string';
import { RedisService } from '~libs/common/Redis/services';
import { I18nContext } from 'nestjs-i18n';
import { I18nTranslations } from '~libs/common/i18n/generated/i18n.generated';

@Injectable()
export class AddressSearchService {
    constructor(
        private readonly ghnService: GhnService,
        private redisService: RedisService,
    ) {}

    private readonly GET_PROVINCES_CACHE_KEY = 'CACHE_address_search_get_provinces';
    private readonly GET_DISTRICTS_CACHE_KEY = 'CACHE_address_search_get_districts';
    private readonly GET_WARDS_CACHE_KEY = 'CACHE_address_search_get_wards';

    async getProvinces(i18n: I18nContext<I18nTranslations>): Promise<GhnProvinceDTO[]> {
        try {
            const listProvinceCache = await this.redisService.get<GhnProvinceDTO[]>(
                this.GET_PROVINCES_CACHE_KEY,
            );
            if (listProvinceCache) {
                return listProvinceCache;
            }

            const listProvince = await this.ghnService.getProvinces();
            if (!listProvince) {
                throw new NotFoundException(
                    i18n.t('errorMessage.PROPERTY_IS_NOT_FOUND', {
                        args: {
                            property: 'provinces',
                        },
                    }),
                );
            }

            await this.setCache(this.GET_PROVINCES_CACHE_KEY, listProvince);
            return listProvince;
        } catch (error) {
            throw new RpcException(
                new BadRequestException(
                    i18n.t('errorMessage.PROPERTY_IS_NOT_FOUND', {
                        args: {
                            property: 'provinces',
                        },
                    }),
                ),
            );
        }
    }

    async getDistricts(
        i18n: I18nContext<I18nTranslations>,
        provinceId: number,
    ): Promise<GhnDistrictDTO[]> {
        if (!provinceId) {
            throw new RpcException(
                new BadRequestException(
                    i18n.t('errorMessage.PROPERTY_IS_REQUIRED', {
                        args: {
                            property: 'provinceId',
                        },
                    }),
                ),
            );
        }

        try {
            const districtCacheKey = `${this.GET_DISTRICTS_CACHE_KEY}_${provinceId}`;
            const listDistrictCache =
                await this.redisService.get<GhnDistrictDTO[]>(districtCacheKey);
            if (listDistrictCache) {
                return listDistrictCache;
            }

            const listDistrict = await this.ghnService.getDistricts(provinceId);
            await this.setCache(districtCacheKey, listDistrict);
            return listDistrict;
        } catch (error) {
            throw new RpcException(
                new NotFoundException(
                    i18n.t('errorMessage.PROPERTY_IS_NOT_FOUND', {
                        args: {
                            property: 'districts',
                        },
                    }),
                ),
            );
        }
    }

    async getWards(i18n: I18nContext<I18nTranslations>, districtId: number): Promise<GhnWardDTO[]> {
        if (!districtId) {
            throw new RpcException(
                new BadRequestException(
                    i18n.t('errorMessage.PROPERTY_IS_NOT_FOUND', {
                        args: {
                            property: 'districts',
                        },
                    }),
                ),
            );
        }

        try {
            const wardCacheKey = `${this.GET_WARDS_CACHE_KEY}_${districtId}`;
            const listWardCache: GhnWardDTO[] = await this.redisService.get(wardCacheKey);
            if (listWardCache) {
                return listWardCache;
            }

            const listWard = await this.ghnService.getWards(districtId);
            if (!listWard) {
                throw new NotFoundException(
                    i18n.t('errorMessage.PROPERTY_IS_NOT_FOUND', {
                        args: {
                            property: 'wards',
                        },
                    }),
                );
            }

            await this.setCache(wardCacheKey, listWard);
            return listWard;
        } catch (error) {
            throw new RpcException(
                new NotFoundException(
                    i18n.t('errorMessage.PROPERTY_IS_NOT_FOUND', {
                        args: {
                            property: 'wards',
                        },
                    }),
                ),
            );
        }
    }

    private async setCache(key: string, value: any, ttl?: number) {
        return this.redisService.set(key, value, ttl ?? convertTimeString('1h'));
    }
}
