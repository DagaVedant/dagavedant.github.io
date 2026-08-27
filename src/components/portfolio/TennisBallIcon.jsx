/** @param {import('react').SVGProps<SVGSVGElement>} props */
const TennisBallIcon = (props) => {
  return (
    <svg {...props} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="10" fill="#CDEB2F" />

      <path
        d="M9 3C5.5 5.5 4 8.5 4 12s1.5 6.5 5 9"
        fill="none"
        stroke="#fff"
        strokeWidth="1.5"
        strokeLinecap="round"
      />

      <path
        d="M15 3c3.5 2.5 5 5.5 5 9s-1.5 6.5-5 9"
        fill="none"
        stroke="#fff"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
};

export default TennisBallIcon;