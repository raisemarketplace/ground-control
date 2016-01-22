// Recommend using cssmodules, but this is fine for demo...

export const routeStyle = {
  padding: 20,
  border: '1px solid #31c1c9',
};

export const navStyle = {
  ...routeStyle,
  borderColor: '#b0babf',
  backgroundColor: '#f4f6f6',
  marginBottom: 20,
  paddingBottom: 10,
};

export const linkStyle = {
  display: 'block',
  color: '#31c1c9',
  marginBottom: '10px',
  textDecoration: 'none',
};

export const inlineLinkStyle = {
  ...linkStyle,
  display: 'inline',
  marginRight: 5,
};

export const errorLinkStyle = {
  ...inlineLinkStyle,
  color: '#ea5454',
};

export const activeLinkStyle = {
  fontWeight: 'bold',
};

export const booksSectionStyle = {
  padding: 20,
  border: '1px solid #b0babf',
};

export const previewTemplateStyle = {
  width: 300,
  height: 15,
  background: '#f4f6f6',
  marginBottom: 3,
};

export const flashStyle = {
  background: '#ea5454',
  color: '#fff',
  display: 'block',
  padding: 20,
  textAlign: 'center',
  border: '1px solid #7D3030',
};
