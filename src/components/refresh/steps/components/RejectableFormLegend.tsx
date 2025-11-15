export const RejectableFormLegend = () => {
  return (
    <legend
      data-testid="rejectable-form-legend"
      className="flex justify-center flex-col gap-2 text-sm font-medium  bg-sky-100 border border-sky-500 rounded-lg b p-4 mb-8"
    >
      <span>Setting PiB amount as 0 will result in the refresh being rejected.</span>
    </legend>
  );
};
