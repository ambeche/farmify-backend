import parseAndValidate from '../../utils/parser';

describe('Parsing and Validation of farm data', () => {
  test('succeeds with valid values or parameters and returns values transformed to the right type', () => {
    const validFarmRecord = {
      farmName: "Sari's Potatoes Farm",
      datetime: '2018-12-31T22:00:00.000Z',
      metricType: 'pH',
      metricValue: 6.52,
    };

    const validated =
      parseAndValidate.parseAndValidateFarmRecord(validFarmRecord);

    expect(validated).toBeTruthy();
    expect(typeof validated?.datetime).not.toBe(
      typeof validFarmRecord.datetime
    );
    expect(validated?.datetime instanceof Date).toBe(true);
    expect(typeof validFarmRecord.datetime).toBe('string');
    expect(validated.toString()).toBe(validFarmRecord.toString());
  });

  describe('fails with an error message and the record is discarded', () => {
    const invalidFarmRecord = {
      farmName: "Sari's Potatoes Farm",
      datetime: '2018-12-31T22:00:00.000Z',
      metricType: 'pH',
      metricValue: 6.52,
    };

    test('if datetime is invalid, but missing date is okay', () => {
      try {
        const withInvalidDate = {
          ...invalidFarmRecord,
          datetime: 'i am invalid date',
        };
        const withMissingDate = { ...invalidFarmRecord, datetime: undefined };

        const validatedWithMissingDate =
          parseAndValidate.parseAndValidateFarmRecord(withMissingDate);
        const validatedWithInvalidDate =
          parseAndValidate.parseAndValidateFarmRecord(withInvalidDate);

        expect(validatedWithInvalidDate).toBeFalsy();
        expect(validatedWithMissingDate).toBeTruthy();
        expect(validatedWithMissingDate?.datetime).toBe(undefined);
        expect(validatedWithMissingDate.farmName).toBe(withMissingDate.farmName);
        expect(Boolean(Date.parse(withInvalidDate.datetime))).toBe(false);
      } catch (error) {
        if (error instanceof Error) expect(error.message).toBeTruthy();
      }
    });

    test('if metric type is invalid', () => {
      try {
        const withInvalidMetricType = {
          ...invalidFarmRecord,
          metricType: 'sunshine',
        };

        const validatedWithInvalidMetricType =
          parseAndValidate.parseAndValidateFarmRecord(withInvalidMetricType);

        expect(validatedWithInvalidMetricType).toBeFalsy();
      } catch (error) {
        if (error instanceof Error) expect(error.message).toBeTruthy();
      }
    });

    test('if metric value is missing or invalid', () => {
      try {
        // valid pH (0 - 14)
        // valid rainFall (0 -500)
        // valid temperature (-50 - 100)
        const withMissingMetricValue = {
          ...invalidFarmRecord,
          metricValue: undefined,
        };
        const withInvalidPHValue = {
          ...invalidFarmRecord,
          metricValue: -1,
          metricType: 'pH',
        };
        const withInvalidRainFallValue = {
          ...invalidFarmRecord,
          metricValue: -10.99,
          metricType: 'rainFall',
        };
        const withInvalidTemperatureValue = {
          ...invalidFarmRecord,
          metricValue: 1000,
          metricType: 'temperature',
        };

        const validatedWithMissingMetricValue =
          parseAndValidate.parseAndValidateFarmRecord(withMissingMetricValue);
        const validatedWithInvalidPHValue =
          parseAndValidate.parseAndValidateFarmRecord(withInvalidPHValue);
        const validatedWithInvalidRainFallValue =
          parseAndValidate.parseAndValidateFarmRecord(withInvalidRainFallValue);
        const validatedWithInvalidTemperatureValue =
          parseAndValidate.parseAndValidateFarmRecord(
            withInvalidTemperatureValue
          );

        expect(validatedWithInvalidPHValue).toBeFalsy();
        expect(validatedWithInvalidTemperatureValue).toBeFalsy();
        expect(validatedWithInvalidRainFallValue).toBeFalsy();
        expect(validatedWithMissingMetricValue).toBeFalsy();
      } catch (error) {
        if (error instanceof Error) expect(error.message).toBeTruthy();
      }
    });
  });
});
