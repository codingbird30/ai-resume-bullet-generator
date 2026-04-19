import React, { useState } from 'react';

const InputForm = () => {
    const [formData, setFormData] = useState({
        jobRole: '',
        yearsOfExperience: '',
        skills: '',
        workDescription: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log(formData);
        // Handle form submission logic here
    };

    return (
        <form onSubmit={handleSubmit}>
            <div>
                <label>
                    Job Role:
                    <input type="text" name="jobRole" value={formData.jobRole} onChange={handleChange} required />
                </label>
            </div>
            <div>
                <label>
                    Years of Experience:
                    <input type="number" name="yearsOfExperience" value={formData.yearsOfExperience} onChange={handleChange} required />
                </label>
            </div>
            <div>
                <label>
                    Skills:
                    <input type="text" name="skills" value={formData.skills} onChange={handleChange} required />
                </label>
            </div>
            <div>
                <label>
                    Work Description:
                    <textarea name="workDescription" value={formData.workDescription} onChange={handleChange} required></textarea>
                </label>
            </div>
            <button type="submit">Submit</button>
        </form>
    );
};

export default InputForm;