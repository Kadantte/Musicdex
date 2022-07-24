import { Checkbox, CheckboxGroup, Input, VStack } from "@chakra-ui/react";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

interface CheckboxSearchListProps {
  dataField: string;
  placeholder?: string;
  showSearch?: boolean;
  aggregations: {
    [k: string]: { buckets: Array<{ key: string; doc_count: number }> };
  };
  setQuery: (query: any) => void;
  value: string[] | null;
}

export const CheckboxSearchList = ({
  dataField,
  placeholder,
  showSearch = false,
  aggregations,
  setQuery,
  value,
}: CheckboxSearchListProps) => {
  const { t } = useTranslation();
  const [filterValue, setFilterValue] = useState("");
  const [checkboxValues, setCheckboxValues] = useState<Array<string | number>>(
    [],
  );

  const getTermsQuery = useCallback(
    (values: typeof checkboxValues) => {
      if (!values?.length) return {};

      return { query: { terms: { [dataField]: values } } };
    },
    [dataField],
  );

  useEffect(() => {
    setQuery({
      value: checkboxValues,
      query: getTermsQuery(checkboxValues),
    });
  }, [checkboxValues, getTermsQuery, setQuery]);

  // Support resetting from SelectedFilters
  useEffect(() => {
    if (value === null) setCheckboxValues([]);
  }, [value]);

  return (
    <>
      {showSearch && (
        <Input
          value={filterValue}
          onChange={(e) => setFilterValue(e.target.value)}
          placeholder={t(placeholder!)}
        />
      )}
      <CheckboxGroup
        value={checkboxValues}
        onChange={(e) => setCheckboxValues(e)}
      >
        <VStack maxH="200px" alignItems="stretch" overflowY="scroll" p={2}>
          {aggregations?.[dataField]?.buckets
            ?.filter(({ key }) =>
              key.toLowerCase().includes(filterValue.toLowerCase()),
            )
            .map(({ key }) => (
              <Checkbox key={key} value={key}>
                {key}
              </Checkbox>
            ))}
        </VStack>
      </CheckboxGroup>
    </>
  );
};
