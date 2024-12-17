/**
File Name : components/select
Description : 셀렉트 컴포넌트
Author : 임도헌

History
Date        Author   Status    Description
2024.12.15  임도헌   Created
2024.12.15  임도헌   Modified  셀렉트 컴포넌트 추가
*/

import { forwardRef } from "react";

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  errors?: string[];
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, errors, children, ...rest }, ref) => {
    return (
      <div className="flex flex-col gap-2">
        {label ? (
          <label className="font-medium dark:text-white">{label}</label>
        ) : null}
        <select
          ref={ref}
          {...rest}
          className="w-full px-4 py-2 transition rounded-md 
            dark:bg-neutral-800 bg-white
            border dark:border-neutral-600 border-neutral-300
            focus:outline-none focus:ring-2 focus:ring-primary
            dark:text-white text-neutral-900
            disabled:opacity-50"
        >
          {children}
        </select>
        {errors?.map((error) => (
          <span key={error} className="text-sm text-red-500">
            {error}
          </span>
        ))}
      </div>
    );
  }
);

Select.displayName = "Select";

export default Select;
