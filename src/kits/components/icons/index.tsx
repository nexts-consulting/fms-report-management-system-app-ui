const baseProps = {
  width: 16,
  height: 16,
  fill: "currentColor",
};

export interface IconProps extends React.ComponentPropsWithoutRef<"svg"> {}

export const Icons = {
  View: (props: IconProps) => (
    <svg {...baseProps} {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
      <path
        d="M30.94,15.66A16.69,16.69,0,0,0,16,5,16.69,16.69,0,0,0,1.06,15.66a1,1,0,0,0,0,.68A16.69,16.69,0,0,0,16,27,16.69,16.69,0,0,0,30.94,16.34,1,1,0,0,0,30.94,15.66ZM16,25c-5.3,0-10.9-3.93-12.93-9C5.1,10.93,10.7,7,16,7s10.9,3.93,12.93,9C26.9,21.07,21.3,25,16,25Z"
        transform="translate(0 0)"
      />
      <path
        d="M16,10a6,6,0,1,0,6,6A6,6,0,0,0,16,10Zm0,10a4,4,0,1,1,4-4A4,4,0,0,1,16,20Z"
        transform="translate(0 0)"
      />
    </svg>
  ),
  ViewOff: (props: IconProps) => (
    <svg {...baseProps} {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
      <path d="M5.24,22.51l1.43-1.42A14.06,14.06,0,0,1,3.07,16C5.1,10.93,10.7,7,16,7a12.38,12.38,0,0,1,4,.72l1.55-1.56A14.72,14.72,0,0,0,16,5,16.69,16.69,0,0,0,1.06,15.66a1,1,0,0,0,0,.68A16,16,0,0,0,5.24,22.51Z" />
      <path d="M12,15.73a4,4,0,0,1,3.7-3.7l1.81-1.82a6,6,0,0,0-7.33,7.33Z" />
      <path d="M30.94,15.66A16.4,16.4,0,0,0,25.2,8.22L30,3.41,28.59,2,2,28.59,3.41,30l5.1-5.1A15.29,15.29,0,0,0,16,27,16.69,16.69,0,0,0,30.94,16.34,1,1,0,0,0,30.94,15.66ZM20,16a4,4,0,0,1-6,3.44L19.44,14A4,4,0,0,1,20,16Zm-4,9a13.05,13.05,0,0,1-6-1.58l2.54-2.54a6,6,0,0,0,8.35-8.35l2.87-2.87A14.54,14.54,0,0,1,28.93,16C26.9,21.07,21.3,25,16,25Z" />
    </svg>
  ),
  Information: (props: IconProps) => (
    <svg {...baseProps} {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
      <polygon points="17 22 17 14 13 14 13 16 15 16 15 22 12 22 12 24 20 24 20 22 17 22" />
      <path d="M16,8a1.5,1.5,0,1,0,1.5,1.5A1.5,1.5,0,0,0,16,8Z" />
      <path d="M16,30A14,14,0,1,1,30,16,14,14,0,0,1,16,30ZM16,4A12,12,0,1,0,28,16,12,12,0,0,0,16,4Z" />
    </svg>
  ),
  Close: (props: IconProps) => (
    <svg {...baseProps} {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
      <polygon points="17.4141 16 24 9.4141 22.5859 8 16 14.5859 9.4143 8 8 9.4141 14.5859 16 8 22.5859 9.4143 24 16 17.4141 22.5859 24 24 22.5859 17.4141 16" />
    </svg>
  ),
  CloseLarge: (props: IconProps) => (
    <svg {...baseProps} {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
      <polygon points="17.4141 16 26 7.4141 24.5859 6 16 14.5859 7.4143 6 6 7.4141 14.5859 16 6 24.5859 7.4143 26 16 17.4141 24.5859 26 26 24.5859 17.4141 16" />
    </svg>
  ),
  Search: (props: IconProps) => (
    <svg {...baseProps} {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
      <path
        d="M29,27.5859l-7.5521-7.5521a11.0177,11.0177,0,1,0-1.4141,1.4141L27.5859,29ZM4,13a9,9,0,1,1,9,9A9.01,9.01,0,0,1,4,13Z"
        transform="translate(0 0)"
      />
    </svg>
  ),
  InfoFilled: (props: IconProps) => (
    <svg {...baseProps} {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
      <path
        fill="none"
        d="M16,8a1.5,1.5,0,1,1-1.5,1.5A1.5,1.5,0,0,1,16,8Zm4,13.875H17.125v-8H13v2.25h1.875v5.75H12v2.25h8Z"
        transform="translate(0 0)"
      />
      <path
        d="M16,2A14,14,0,1,0,30,16,14,14,0,0,0,16,2Zm0,6a1.5,1.5,0,1,1-1.5,1.5A1.5,1.5,0,0,1,16,8Zm4,16.125H12v-2.25h2.875v-5.75H13v-2.25h4.125v8H20Z"
        transform="translate(0 0)"
      />
    </svg>
  ),
  CheckedFilled: (props: IconProps) => (
    <svg {...baseProps} {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
      <path d="M16,2A14,14,0,1,0,30,16,14,14,0,0,0,16,2ZM14,21.5908l-5-5L10.5906,15,14,18.4092,21.41,11l1.5957,1.5859Z" />
      <polygon
        fill="none"
        points="14 21.591 9 16.591 10.591 15 14 18.409 21.41 11 23.005 12.585 14 21.591"
      />
    </svg>
  ),
  ErrorFilled: (props: IconProps) => (
    <svg {...baseProps} {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
      <rect
        fill="none"
        x="14.9004"
        y="7.2004"
        width="2.1996"
        height="17.5994"
        transform="translate(-6.6275 16.0001) rotate(-45)"
      />
      <path d="M16,2A13.914,13.914,0,0,0,2,16,13.914,13.914,0,0,0,16,30,13.914,13.914,0,0,0,30,16,13.914,13.914,0,0,0,16,2Zm5.4449,21L9,10.5557,10.5557,9,23,21.4448Z" />
    </svg>
  ),
  WarningFilled: (props: IconProps) => (
    <svg {...baseProps} {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
      <path
        d="M16,2C8.3,2,2,8.3,2,16s6.3,14,14,14s14-6.3,14-14C30,8.3,23.7,2,16,2z M14.9,8h2.2v11h-2.2V8z M16,25
      c-0.8,0-1.5-0.7-1.5-1.5S15.2,22,16,22c0.8,0,1.5,0.7,1.5,1.5S16.8,25,16,25z"
      />
      <path
        fill="none"
        d="M17.5,23.5c0,0.8-0.7,1.5-1.5,1.5c-0.8,0-1.5-0.7-1.5-1.5S15.2,22,16,22
      C16.8,22,17.5,22.7,17.5,23.5z M17.1,8h-2.2v11h2.2V8z"
      />
    </svg>
  ),
  InformationFilled: (props: IconProps) => (
    <svg {...baseProps} {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
      <path
        fill="none"
        d="M16,8a1.5,1.5,0,1,1-1.5,1.5A1.5,1.5,0,0,1,16,8Zm4,13.875H17.125v-8H13v2.25h1.875v5.75H12v2.25h8Z"
        transform="translate(0 0)"
      />
      <path
        d="M16,2A14,14,0,1,0,30,16,14,14,0,0,0,16,2Zm0,6a1.5,1.5,0,1,1-1.5,1.5A1.5,1.5,0,0,1,16,8Zm4,16.125H12v-2.25h2.875v-5.75H13v-2.25h4.125v8H20Z"
        transform="translate(0 0)"
      />
    </svg>
  ),
  ArrowLeft: (props: IconProps) => (
    <svg {...baseProps} {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
      <polygon points="14 26 15.41 24.59 7.83 17 28 17 28 15 7.83 15 15.41 7.41 14 6 4 16 14 26" />
    </svg>
  ),
  ArrowRight: (props: IconProps) => (
    <svg {...baseProps} {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
      <polygon points="18 6 16.57 7.393 24.15 15 4 15 4 17 24.15 17 16.57 24.573 18 26 28 16 18 6" />
    </svg>
  ),
  Map: (props: IconProps) => (
    <svg {...baseProps} {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
      <path
        d="M16,24l-6.09-8.6A8.14,8.14,0,0,1,16,2a8.08,8.08,0,0,1,8,8.13,8.2,8.2,0,0,1-1.8,5.13ZM16,4a6.07,6.07,0,0,0-6,6.13,6.19,6.19,0,0,0,1.49,4L16,20.52,20.63,14A6.24,6.24,0,0,0,22,10.13,6.07,6.07,0,0,0,16,4Z"
        transform="translate(0 0)"
      />
      <circle cx="16" cy="9" r="2" />
      <path
        d="M28,12H26v2h2V28H4V14H6V12H4a2,2,0,0,0-2,2V28a2,2,0,0,0,2,2H28a2,2,0,0,0,2-2V14A2,2,0,0,0,28,12Z"
        transform="translate(0 0)"
      />
    </svg>
  ),
  Add: (props: IconProps) => (
    <svg {...baseProps} {...props} viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
      <polygon points="17,15 17,8 15,8 15,15 8,15 8,17 15,17 15,24 17,24 17,17 24,17 24,15 " />
    </svg>
  ),
  Subtract: (props: IconProps) => (
    <svg {...baseProps} {...props} viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
      <rect x="8" y="15" width="16" height="2" />
    </svg>
  ),
  CenterSquare: (props: IconProps) => (
    <svg {...baseProps} {...props} viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
      <polygon points="6 12 4 12 4 4 12 4 12 6 6 6 6 12" />
      <polygon points="28 12 26 12 26 6 20 6 20 4 28 4 28 12" />
      <polygon points="12 28 4 28 4 20 6 20 6 26 12 26 12 28" />
      <polygon points="28 28 20 28 20 26 26 26 26 20 28 20 28 28" />
      <rect x="15" y="10" width="2" height="4" />
      <rect x="10" y="15" width="4" height="2" />
      <rect x="18" y="15" width="4" height="2" />
      <rect x="15" y="18" width="2" height="4" />
    </svg>
  ),
  Calendar: (props: IconProps) => (
    <svg {...baseProps} {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
      <path
        d="M26,4h-4V2h-2v2h-8V2h-2v2H6C4.9,4,4,4.9,4,6v20c0,1.1,0.9,2,2,2h20c1.1,0,2-0.9,2-2V6C28,4.9,27.1,4,26,4z M26,26H6V12h20
	V26z M26,10H6V6h4v2h2V6h8v2h2V6h4V10z"
      />
    </svg>
  ),
  Location: (props: IconProps) => (
    <svg {...baseProps} {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
      <path d="M16,18a5,5,0,1,1,5-5A5.0057,5.0057,0,0,1,16,18Zm0-8a3,3,0,1,0,3,3A3.0033,3.0033,0,0,0,16,10Z" />
      <path d="M16,30,7.5645,20.0513c-.0479-.0571-.3482-.4515-.3482-.4515A10.8888,10.8888,0,0,1,5,13a11,11,0,0,1,22,0,10.8844,10.8844,0,0,1-2.2148,6.5973l-.0015.0025s-.3.3944-.3447.4474ZM8.8125,18.395c.001.0007.2334.3082.2866.3744L16,26.9079l6.91-8.15c.0439-.0552.2783-.3649.2788-.3657A8.901,8.901,0,0,0,25,13,9,9,0,1,0,7,13a8.9054,8.9054,0,0,0,1.8125,5.395Z" />
    </svg>
  ),
  TaskLocation: (props: IconProps) => (
    <svg {...baseProps} {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
      <circle cx="24" cy="21" r="2" />
      <path d="M24,31l-4.7788-6.4019A5.9354,5.9354,0,0,1,18,21a6,6,0,0,1,12,0,5.9407,5.9407,0,0,1-1.2246,3.6028Zm0-14a4.0045,4.0045,0,0,0-4,4,3.9572,3.9572,0,0,0,.82,2.3972L24,27.6567l3.1763-4.2548A3.9627,3.9627,0,0,0,28,21,4.0045,4.0045,0,0,0,24,17Z" />
      <path d="M25,5H22V4a2.0058,2.0058,0,0,0-2-2H12a2.0058,2.0058,0,0,0-2,2V5H7A2.0058,2.0058,0,0,0,5,7V28a2.0058,2.0058,0,0,0,2,2h9V28H7V7h3v3H22V7h3v5h2V7A2.0058,2.0058,0,0,0,25,5ZM20,8H12V4h8Z" />
    </svg>
  ),
  Login: (props: IconProps) => (
    <svg {...baseProps} {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
      <path d="M26,30H14a2,2,0,0,1-2-2V25h2v3H26V4H14V7H12V4a2,2,0,0,1,2-2H26a2,2,0,0,1,2,2V28A2,2,0,0,1,26,30Z" />
      <polygon points="14.59 20.59 18.17 17 4 17 4 15 18.17 15 14.59 11.41 16 10 22 16 16 22 14.59 20.59" />
    </svg>
  ),
  Logout: (props: IconProps) => (
    <svg {...baseProps} {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
      <path d="M6,30H18a2.0023,2.0023,0,0,0,2-2V25H18v3H6V4H18V7h2V4a2.0023,2.0023,0,0,0-2-2H6A2.0023,2.0023,0,0,0,4,4V28A2.0023,2.0023,0,0,0,6,30Z" />
      <polygon points="20.586 20.586 24.172 17 10 17 10 15 24.172 15 20.586 11.414 22 10 28 16 22 22 20.586 20.586" />
    </svg>
  ),
  Time: (props: IconProps) => (
    <svg {...baseProps} {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
      <path d="M16,30A14,14,0,1,1,30,16,14,14,0,0,1,16,30ZM16,4A12,12,0,1,0,28,16,12,12,0,0,0,16,4Z" />
      <polygon points="20.59 22 15 16.41 15 7 17 7 17 15.58 22 20.59 20.59 22" />
    </svg>
  ),
  ChevronDown: (props: IconProps) => (
    <svg {...baseProps} {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
      <polygon points="16,22 6,12 7.4,10.6 16,19.2 24.6,10.6 26,12 " />
    </svg>
  ),
  ChevronUp: (props: IconProps) => (
    <svg {...baseProps} {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
      <polygon points="16,10 26,20 24.6,21.4 16,12.8 7.4,21.4 6,20 " />
    </svg>
  ),
  ChevronLeft: (props: IconProps) => (
    <svg {...baseProps} {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
      <polygon points="10,16 20,6 21.4,7.4 12.8,16 21.4,24.6 20,26 " />
    </svg>
  ),
  ChevronRight: (props: React.ComponentPropsWithoutRef<"svg">) => (
    <svg {...baseProps} {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
      <polygon points="22,16 12,26 10.6,24.6 19.2,16 10.6,7.4 12,6 " />
      <polygon points="22,16 12,26 10.6,24.6 19.2,16 10.6,7.4 12,6 " />
    </svg>
  ),
  Aperture: (props: IconProps) => (
    <svg {...baseProps} {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
      <path d="M16,2A14,14,0,1,0,30,16,14,14,0,0,0,16,2ZM27.84,14.14,22,17.52V5.62A12,12,0,0,1,27.84,14.14ZM12,18.68V13.32L16,11l4,2.31v5.36L16,21Zm8-14V11L10.34,5.42A11.9,11.9,0,0,1,20,4.7Zm-11.52,2L14,9.85,4,15.62A12,12,0,0,1,8.48,6.66ZM4.16,17.85,10,14.47V26.38A12,12,0,0,1,4.16,17.85ZM12,27.3V21l9.67,5.58A11.92,11.92,0,0,1,16,28,12.05,12.05,0,0,1,12,27.3Zm11.52-2L18,22.14l10-5.77A12,12,0,0,1,23.52,25.34Z" />
    </svg>
  ),
  Rotate: (props: IconProps) => (
    <svg {...baseProps} {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
      <path d="M17.91,26.82l.35,2a12.9,12.9,0,0,0,4.24-1.54l-1-1.73A10.88,10.88,0,0,1,17.91,26.82Z" />
      <path d="M24.42,23.07,26,24.35a13,13,0,0,0,2.24-3.91l-1.87-.68A11,11,0,0,1,24.42,23.07Z" />
      <path d="M9.5,27.25a12.9,12.9,0,0,0,4.24,1.54l.35-2a10.88,10.88,0,0,1-3.59-1.3Z" />
      <path d="M5.67,19.76l-1.87.68A13,13,0,0,0,6,24.35l.32-.26,1.22-1h0a11,11,0,0,1-1.91-3.31Z" />
      <path d="M29,16a12.85,12.85,0,0,0-.8-4.44l-1.87.68A11.18,11.18,0,0,1,27,16Z" />
      <path d="M26,7.65a13,13,0,0,0-20,0V4H4v8h8V10H6.81A11,11,0,0,1,24.42,8.93Z" />
    </svg>
  ),
  Image: (props: IconProps) => (
    <svg {...baseProps} {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
      <path d="M19,14a3,3,0,1,0-3-3A3,3,0,0,0,19,14Zm0-4a1,1,0,1,1-1,1A1,1,0,0,1,19,10Z" />
      <path d="M26,4H6A2,2,0,0,0,4,6V26a2,2,0,0,0,2,2H26a2,2,0,0,0,2-2V6A2,2,0,0,0,26,4Zm0,22H6V20l5-5,5.59,5.59a2,2,0,0,0,2.82,0L21,19l5,5Zm0-4.83-3.59-3.59a2,2,0,0,0-2.82,0L18,19.17l-5.59-5.59a2,2,0,0,0-2.82,0L6,17.17V6H26Z" />
    </svg>
  ),
  Report: (props: IconProps) => (
    <svg {...baseProps} {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
      <rect x="10" y="18" width="8" height="2" />
      <rect x="10" y="13" width="12" height="2" />
      <rect x="10" y="23" width="5" height="2" />
      <path d="M25,5H22V4a2,2,0,0,0-2-2H12a2,2,0,0,0-2,2V5H7A2,2,0,0,0,5,7V28a2,2,0,0,0,2,2H25a2,2,0,0,0,2-2V7A2,2,0,0,0,25,5ZM12,4h8V8H12ZM25,28H7V7h3v3H22V7h3Z" />
    </svg>
  ),
  Pedestrian: (props: IconProps) => (
    <svg {...baseProps} {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
      <path d="M21.6772,14l-1.2456-3.1143A2.9861,2.9861,0,0,0,17.646,9H13.5542a3.0018,3.0018,0,0,0-1.5439.4277L7,12.4336V18H9V13.5664l3-1.8V23.6973L8.5383,28.8906,10.2024,30,14,24.3027V11h3.646a.9949.9949,0,0,1,.9282.6289L20.3228,16H26V14Z" />
      <polygon points="17.051 18.316 19 24.162 19 30 21 30 21 23.838 18.949 17.684 17.051 18.316" />
      <path d="M16.5,8A3.5,3.5,0,1,1,20,4.5,3.5042,3.5042,0,0,1,16.5,8Zm0-5A1.5,1.5,0,1,0,18,4.5,1.5017,1.5017,0,0,0,16.5,3Z" />
    </svg>
  ),
  Menu: (props: IconProps) => (
    <svg {...baseProps} {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
      <rect x="4" y="6" width="24" height="2" />
      <rect x="4" y="24" width="24" height="2" />
      <rect x="4" y="12" width="24" height="2" />
      <rect x="4" y="18" width="24" height="2" />
    </svg>
  ),
  PortOutput: (props: IconProps) => (
    <svg {...baseProps} {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
      <polygon points="30 16 23 9 21.5859 10.4141 26.1719 15 9 15 9 17 26.1719 17 21.5859 21.5859 23 23 30 16" />
      <path d="M14,28c-6.6167,0-12-5.3832-12-12S7.3833,4,14,4c2.335,0,4.5986,.6714,6.5461,1.9414l-1.0923,1.6753c-1.6221-1.0576-3.5078-1.6167-5.4539-1.6167-5.5139,0-10,4.486-10,10s4.4861,10,10,10c1.946,0,3.8318-.5591,5.4539-1.6167l1.0923,1.6753c-1.9475,1.27-4.2112,1.9414-6.5461,1.9414Z" />
    </svg>
  ),
  TaskAdd: (props: IconProps) => (
    <svg {...baseProps} {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
      <polygon points="31 24 27 24 27 20 25 20 25 24 21 24 21 26 25 26 25 30 27 30 27 26 31 26 31 24" />
      <polygon points="31 24 27 24 27 20 25 20 25 24 21 24 21 26 25 26 25 30 27 30 27 26 31 26 31 24" />
      <path d="M25,5H22V4a2.0058,2.0058,0,0,0-2-2H12a2.0058,2.0058,0,0,0-2,2V5H7A2.0058,2.0058,0,0,0,5,7V28a2.0058,2.0058,0,0,0,2,2H17V28H7V7h3v3H22V7h3v9h2V7A2.0058,2.0058,0,0,0,25,5ZM20,8H12V4h8Z" />
    </svg>
  ),
  Checkbox: (props: IconProps) => (
    <svg {...baseProps} {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
      <path d="M26,4H6A2,2,0,0,0,4,6V26a2,2,0,0,0,2,2H26a2,2,0,0,0,2-2V6A2,2,0,0,0,26,4ZM6,26V6H26V26Z" />
    </svg>
  ),
  CheckboxCheckedFilled: (props: IconProps) => (
    <svg {...baseProps} {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
      <path
        d="M26,4H6A2,2,0,0,0,4,6V26a2,2,0,0,0,2,2H26a2,2,0,0,0,2-2V6A2,2,0,0,0,26,4ZM14,21.5,9,16.5427,10.5908,15,14,18.3456,21.4087,11l1.5918,1.5772Z"
        transform="translate(0 0)"
      />
      <path
        id="inner-path"
        d="M14,21.5,9,16.5427,10.5908,15,14,18.3456,21.4087,11l1.5918,1.5772Z"
        transform="translate(0 0)"
        fill="none"
      />
    </svg>
  ),
  CheckboxIndeterminate: (props: IconProps) => (
    <svg {...baseProps} {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
      <title>checkbox--indeterminate--filled</title>
      <path d="M26,4H6A2,2,0,0,0,4,6V26a2,2,0,0,0,2,2H26a2,2,0,0,0,2-2V6A2,2,0,0,0,26,4ZM22,18H10V14H22Z" />
      <path id="inner-path" fill="none" d="M22,18H10V14H22Z" />
    </svg>
  ),
  Credentials: (props: IconProps) => (
    <svg {...baseProps} {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
      <path d="M16,22a4,4,0,1,0-4-4A4,4,0,0,0,16,22Zm0-6a2,2,0,1,1-2,2A2,2,0,0,1,16,16Z" />
      <rect x="14" y="6" width="4" height="2" />
      <path d="M24,2H8A2.002,2.002,0,0,0,6,4V28a2.0023,2.0023,0,0,0,2,2H24a2.0027,2.0027,0,0,0,2-2V4A2.0023,2.0023,0,0,0,24,2ZM20,28H12V26a1,1,0,0,1,1-1h6a1,1,0,0,1,1,1Zm2,0V26a3,3,0,0,0-3-3H13a3,3,0,0,0-3,3v2H8V4H24V28Z" />
    </svg>
  ),
  Maximize: (props: IconProps) => (
    <svg {...baseProps} {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
      <polygon points="20 2 20 4 26.586 4 18 12.582 19.414 14 28 5.414 28 12 30 12 30 2 20 2" />
      <polygon points="14 19.416 12.592 18 4 26.586 4 20 2 20 2 30 12 30 12 28 5.414 28 14 19.416" />
    </svg>
  ),
  Minimize: (props: IconProps) => (
    <svg {...baseProps} {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
      <polygon
        points="4 18 4 20 10.58
      Inven6 20 2 28.582 3.414 30 12 21.414 12 28 14 28 14 18 4 18"
      />
      <polygon points="30 3.416 28.592 2 20 10.586 20 4 18 4 18 14 28 14 28 12 21.414 12 30 3.416" />
    </svg>
  ),
  Radar: (props: IconProps) => (
    <svg {...baseProps} {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
      <path
        d="M30,3.4141,28.5859,2,15.293,15.293a1,1,0,0,0,1.414,1.414l4.18-4.1792A5.9956,5.9956,0,1,1,16,10V8a8.011,8.011,0,1,0,6.3164,3.0977L25.1631,8.251A11.881,11.881,0,0,1,28,16,12,12,0,1,1,16,4V2A14,14,0,1,0,30,16a13.8572,13.8572,0,0,0-3.4224-9.1636Z"
        transform="translate(0 0)"
      />
    </svg>
  ),
  ChangeCatalogue: (props: IconProps) => (
    <svg {...baseProps} {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
      <path d="M24,24v2h2.4592A5.94,5.94,0,0,1,22,28a6.0066,6.0066,0,0,1-6-6H14a7.9841,7.9841,0,0,0,14,5.2651V30h2V24Z" />
      <path d="M22,14a8.04,8.04,0,0,0-6,2.7349V14H14v6h6V18H17.5408A5.94,5.94,0,0,1,22,16a6.0066,6.0066,0,0,1,6,6h2A8.0092,8.0092,0,0,0,22,14Z" />
      <path d="M12,28H6V24H8V22H6V17H8V15H6V10H8V8H6V4H24v8h2V4a2,2,0,0,0-2-2H6A2,2,0,0,0,4,4V8H2v2H4v5H2v2H4v5H2v2H4v4a2,2,0,0,0,2,2h6Z" />
    </svg>
  ),
  Alarm: (props: IconProps) => (
    <svg {...baseProps} {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
      <path d="M16,28A11,11,0,1,1,27,17,11,11,0,0,1,16,28ZM16,8a9,9,0,1,0,9,9A9,9,0,0,0,16,8Z" />
      <polygon points="18.59 21 15 17.41 15 11 17 11 17 16.58 20 19.59 18.59 21" />
      <rect
        x="3.96"
        y="5.5"
        width="5.07"
        height="2"
        transform="translate(-2.69 6.51) rotate(-45.06)"
      />
      <rect
        x="24.5"
        y="3.96"
        width="2"
        height="5.07"
        transform="translate(2.86 19.91) rotate(-44.94)"
      />
    </svg>
  ),
  Camera: (props: IconProps) => (
    <svg {...baseProps} {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
      <path d="M29,26H3a1,1,0,0,1-1-1V8A1,1,0,0,1,3,7H9.46l1.71-2.55A1,1,0,0,1,12,4h8a1,1,0,0,1,.83.45L22.54,7H29a1,1,0,0,1,1,1V25A1,1,0,0,1,29,26ZM4,24H28V9H22a1,1,0,0,1-.83-.45L19.46,6H12.54L10.83,8.55A1,1,0,0,1,10,9H4Z" />
      <path d="M16,22a6,6,0,1,1,6-6A6,6,0,0,1,16,22Zm0-10a4,4,0,1,0,4,4A4,4,0,0,0,16,12Z" />
    </svg>
  ),
};
