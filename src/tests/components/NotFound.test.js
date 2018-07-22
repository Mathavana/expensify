import React from 'react';
import { shallow } from 'enzyme';
import { NotFoundPage } from '../../components/NotFoundPage';

test('Should render Not found page', () => {
    const wrapper = shallow(<NotFoundPage />);
    expect(wrapper).toMatchSnapshot();
});