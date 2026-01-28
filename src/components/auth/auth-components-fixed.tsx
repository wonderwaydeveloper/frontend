        <input
          className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors text-gray-900 placeholder-gray-400 ${
            hasErrors ? 'border-red-300' : 'border-gray-300'
          } ${fieldType === 'password' ? 'pr-12' : ''} ${className}`}
          type={fieldType === 'password' ? (showPassword ? 'text' : 'password') : (props.type || 'text')}
          value={value}
          onChange={handleChange}
          {...props}
        />